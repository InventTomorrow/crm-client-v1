"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import {
  confirmWATakeover,
  connectWA,
  denyWATakeover,
  disconnectWA,
  getWAConfig,
  getWAStatus,
  updateWAConfig,
} from "../services/channelsService";
import type { WAConfig, WASSEEvent, WAState } from "../types";

export function useWAStatus() {
  return useQuery({
    queryKey: ["wa-status"],
    queryFn: getWAStatus,
    // Poll fast while connecting/disconnected so the UI catches a backend status
    // flip (e.g. `ready` firing late on a slow host) within seconds instead of
    // 10s — and so it never depends solely on the flaky long-lived SSE. Back off
    // once CONNECTED, where live changes arrive over the stream anyway.
    refetchInterval: (query) =>
      query.state.data?.status === "CONNECTED" ? 15_000 : 3_000,
  });
}

export function useWAConfig() {
  return useQuery({ queryKey: ["wa-config"], queryFn: getWAConfig });
}

export function useWAConnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectWA,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa-status"] }),
    onError: (error) =>
      toast.error(
        extractErrorMessage(error, "Failed to start WhatsApp session"),
      ),
  });
}

export function useWADisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectWA,
    onSuccess: () => {
      toast.success("WhatsApp disconnected");
      queryClient.invalidateQueries({ queryKey: ["wa-status"] });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to disconnect")),
  });
}

export function useWATakeoverConfirm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmWATakeover,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wa-status"] }),
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to confirm takeover")),
  });
}

export function useWATakeoverDeny() {
  return useMutation({
    mutationFn: denyWATakeover,
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to deny takeover")),
  });
}

export function useUpdateWAConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<WAConfig>) => updateWAConfig(config),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["wa-config"] });
      const prev = queryClient.getQueryData<WAConfig>(["wa-config"]);
      queryClient.setQueryData<WAConfig>(
        ["wa-config"],
        (old: WAConfig | undefined) => ({
          ...old!,
          ...next,
        }),
      );
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to update settings"));
      if (ctx?.prev) queryClient.setQueryData(["wa-config"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wa-config"] }),
  });
}

/**
 * Always-on SSE subscriber and the single source of truth for live WhatsApp
 * state. Folds every event type (qr / status / phone-conflict) into the
 * `wa-status` query cache so the whole app — status button and connect dialog —
 * reads one consistent value. Mount once near the app root.
 */
export function useWAStatusStream() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const es = new EventSource("/api/v1/whatsapp/qr-stream", {
      withCredentials: true,
    });
    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as WASSEEvent;
        queryClient.setQueryData<WAState>(
          ["wa-status"],
          (old: WAState | undefined): WAState => {
            switch (event.type) {
              case "qr":
                return {
                  status: "PENDING",
                  phoneNumber: old?.phoneNumber,
                  qr: event.qr,
                  error: undefined,
                  conflict: undefined,
                };
              case "status":
                return {
                  status: event.status,
                  phoneNumber: event.phoneNumber ?? old?.phoneNumber,
                  error: event.error,
                  // Keep the QR/conflict only while still pending; clear once a
                  // definitive status (CONNECTED / DISCONNECTED) arrives.
                  qr: event.status === "PENDING" ? old?.qr : undefined,
                  conflict:
                    event.status === "PENDING" ? old?.conflict : undefined,
                };
              case "phone-conflict":
                return {
                  status: "PENDING",
                  phoneNumber: old?.phoneNumber,
                  qr: undefined,
                  error: undefined,
                  conflict: {
                    phoneNumber: event.phoneNumber,
                    conflictWorkspaces: event.conflictWorkspaces,
                  },
                };
              default:
                return old ?? { status: "DISCONNECTED" };
            }
          },
        );
      } catch {
        /* ignore malformed */
      }
    };
    // A transient SSE drop (idle-proxy timeout, brief network blip) is NOT a
    // session disconnect. Don't close or override status here: EventSource
    // auto-reconnects and the server re-sends current status on each (re)open.
    // The polled useWAStatus query stays the backup source of truth meanwhile.
    es.onerror = () => {};
    return () => es.close();
  }, [queryClient]);
}
