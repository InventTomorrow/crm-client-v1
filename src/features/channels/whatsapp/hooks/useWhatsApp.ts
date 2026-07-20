"use client";
import { extractErrorMessage } from "@/lib/utils";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
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
} from "../services/whatsapp.service";
import type { WAConfig, WASSEEvent, WAState } from "../types";

let lastWaSseEventAt = 0;

export function useWAStatus() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["wa-status"],
    queryFn: async () => {
      const startedAt = Date.now();
      const fresh = await getWAStatus();
      if (lastWaSseEventAt > startedAt) {
        return queryClient.getQueryData<WAState>(["wa-status"]) ?? fresh;
      }
      return fresh;
    },
    // SSE is the live source of truth — this is just a safety net. Poll every
    // 2s while we're in a transitional state waiting for the stream to catch
    // us up: PENDING with no QR/conflict yet, or CONNECTING (the window right
    // after a scan, before the server's async open-handshake — phone-conflict
    // check, DB upsert — has finished and emitted the terminal status). No
    // polling once connected/disconnected — the default window-focus refetch
    // covers that.
    refetchInterval: (query) => {
      const data = query.state.data;
      const waitingOnPendingQr =
        data?.status === "PENDING" && !data.qr && !data.conflict;
      const waitingOnConnectingResult = data?.status === "CONNECTING";
      return waitingOnPendingQr || waitingOnConnectingResult ? 2_000 : false;
    },
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
  // SSE is authoritative — discard any in-flight `wa-status` REST fetch (the
  // safety-net poll, or a window-focus refetch) so a response computed before
  // this event can't land later and overwrite it with stale data. Also stamp
  // the time so a fetch already past cancellation (in-flight request whose
  // response lands after this write) gets caught by the queryFn's staleness
  // check in useWAStatus instead of regressing the cache.
  lastWaSseEventAt = Date.now();
  void queryClient.cancelQueries({ queryKey: ["wa-status"], exact: true });
  queryClient.setQueryData<WAState>(
    ["wa-status"],
    (old: WAState | undefined): WAState => {
      switch (event.type) {
        case "qr":
          // A QR event can arrive after a CONNECTING/CONNECTED status event
          // (server emits them from separate async handlers, so ordering on
          // the SSE stream isn't guaranteed). Once past PENDING, ignore a
          // stale QR instead of regressing the status back to PENDING.
          if (old?.status === "CONNECTING" || old?.status === "CONNECTED") {
            return old;
          }
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
