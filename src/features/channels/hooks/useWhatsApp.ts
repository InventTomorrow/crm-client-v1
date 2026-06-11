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
import type { WAConfig, WASSEEvent, WASessionStatus, WAState } from "../types";

export function useWAStatus() {
  return useQuery({
    queryKey: ["wa-status"],
    queryFn: getWAStatus,
    refetchInterval: 10_000,
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

/** Always-on SSE subscriber — keeps the wa-status query cache in sync without polling. */
export function useWAStatusStream() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const es = new EventSource("/api/v1/whatsapp/qr-stream", { withCredentials: true });
    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as WASSEEvent;
        if (event.type === "status") {
          queryClient.setQueryData<WAState>(["wa-status"], (old) => ({
            status: event.status,
            phoneNumber: event.phoneNumber ?? old?.phoneNumber,
            error: event.error,
          }));
        }
      } catch { /* ignore malformed */ }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [queryClient]);
}

/** Opens an SSE connection to /whatsapp/qr-stream and returns live QR + status. */
export function useWAEventStream(enabled: boolean) {
  const [qr, setQr] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<WASessionStatus | null>(null);
  const [livePhone, setLivePhone] = useState<string | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Fresh stream — clear any state left over from a previous session so a
    // retry doesn't briefly show the old QR / error before new events arrive.
    setQr(null);
    setLiveStatus(null);
    setLivePhone(null);
    setLiveError(null);
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
      es.close();
      setLiveStatus("DISCONNECTED");
      setLiveError("Stream connection failed. Please try again.");
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled]);

  return { qr, liveStatus, livePhone, liveError };
}
