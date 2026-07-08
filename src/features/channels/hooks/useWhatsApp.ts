"use client";
import { extractErrorMessage } from "@/lib/utils";
import {
  type QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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
    // No polling: the SSE stream is the live source of truth and the server
    // re-sends current status on every (re)open. The default window-focus
    // refetch reconciles any event missed while the tab was hidden.
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
 * Folds a WhatsApp SSE event (qr / status / phone-conflict) into the
 * `wa-status` query cache so the whole app — status button and connect dialog —
 * reads one consistent value. Called by useAppEvents for every WA event.
 */
export function applyWAEventToCache(
  queryClient: QueryClient,
  event: WASSEEvent,
): void {
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
            // definitive status (CONNECTING / CONNECTED / DISCONNECTED) arrives.
            qr: event.status === "PENDING" ? old?.qr : undefined,
            conflict: event.status === "PENDING" ? old?.conflict : undefined,
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
}
