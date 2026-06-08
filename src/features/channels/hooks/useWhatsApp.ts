"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  connectWA,
  disconnectWA,
  getWAConfig,
  getWAStatus,
  updateWAConfig,
} from "../services/channelsService";
import type { WAConfig, WASSEEvent, WASessionStatus } from "../types";

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

export function useUpdateWAConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<WAConfig>) => updateWAConfig(config),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["wa-config"] });
      const prev = queryClient.getQueryData<WAConfig>(["wa-config"]);
      queryClient.setQueryData<WAConfig>(["wa-config"], (old) => ({
        ...old!,
        ...next,
      }));
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to update settings"));
      if (ctx?.prev) queryClient.setQueryData(["wa-config"], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["wa-config"] }),
  });
}

/** Opens an SSE connection to /whatsapp/qr-stream and returns live QR + status. */
export function useWAEventStream(enabled: boolean) {
  const [qr, setQr] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<WASessionStatus | null>(null);
  const [livePhone, setLivePhone] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Reset live state on every (re)entry. When the stream is OFF this leaves the
    // polled useWAStatus query as the single source of truth — a stale CONNECTED
    // can no longer shadow it after disconnect/teardown (which is why the UI used
    // to need a manual refresh). When turning ON, it clears the previous session
    // so a retry doesn't flash an old QR/status.
    setQr(null);
    setLiveStatus(null);
    setLivePhone(null);
    setLiveError(null);

    if (!enabled) return;
    const base = "/api/v1";
    const es = new EventSource(`${base}/whatsapp/qr-stream`, {
      withCredentials: true,
    });
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      const event: WASSEEvent = JSON.parse(e.data as string);
      if (event.type === "qr") {
        setQr(event.qr);
        setLiveStatus("PENDING");
        setLiveError(null);
      } else if (event.type === "status") {
        setLiveStatus(event.status);
        setLivePhone(event.phoneNumber ?? null);
        setLiveError(event.error ?? null);
        if (event.status === "CONNECTED") setQr(null);
        if (event.status === "PENDING") setLiveError(null);
      }
    };

    es.onerror = () => {
      // A transient SSE drop (idle-proxy timeout, brief network blip) is NOT a
      // session disconnect. Forcing DISCONNECTED here used to mask a real
      // CONNECTED: the long-lived QR stream gets cut while the user scans, the
      // phone links, the server goes CONNECTED — but the stale DISCONNECTED
      // shadowed the polled /status and the CRM stayed stuck.
      //
      // Don't close and don't override status: EventSource auto-reconnects, and
      // the server re-sends the current status on each (re)open. The polled
      // useWAStatus query remains the source of truth meanwhile.
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled]);

  return { qr, liveStatus, livePhone, liveError };
}
