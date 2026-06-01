'use client';
import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  connectWA,
  disconnectWA,
  getWAConfig,
  getWAStatus,
  updateWAConfig,
} from '../services/channelsService';
import type { WAConfig, WASessionStatus, WASSEEvent } from '../types';

export function useWAStatus() {
  return useQuery({
    queryKey: ['wa-status'],
    queryFn: getWAStatus,
    refetchInterval: 10_000,
  });
}

export function useWAConfig() {
  return useQuery({ queryKey: ['wa-config'], queryFn: getWAConfig });
}

export function useWAConnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: connectWA,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wa-status'] }),
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to start WhatsApp session')),
  });
}

export function useWADisconnect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: disconnectWA,
    onSuccess: () => {
      toast.success('WhatsApp disconnected');
      queryClient.invalidateQueries({ queryKey: ['wa-status'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to disconnect')),
  });
}

export function useUpdateWAConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<WAConfig>) => updateWAConfig(config),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ['wa-config'] });
      const prev = queryClient.getQueryData<WAConfig>(['wa-config']);
      queryClient.setQueryData<WAConfig>(['wa-config'], (old) => ({ ...old!, ...next }));
      return { prev };
    },
    onError: (error, _vars, ctx) => {
      toast.error(extractErrorMessage(error, 'Failed to update settings'));
      if (ctx?.prev) queryClient.setQueryData(['wa-config'], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['wa-config'] }),
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
    if (!enabled) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? '';
    const es = new EventSource(`${base}/whatsapp/qr-stream`, { withCredentials: true });
    esRef.current = es;

    es.onmessage = (e: MessageEvent) => {
      const event: WASSEEvent = JSON.parse(e.data as string);
      if (event.type === 'qr') {
        setQr(event.qr);
        setLiveStatus('PENDING');
        setLiveError(null);
      } else if (event.type === 'status') {
        setLiveStatus(event.status);
        setLivePhone(event.phoneNumber ?? null);
        setLiveError(event.error ?? null);
        if (event.status === 'CONNECTED') setQr(null);
        if (event.status === 'PENDING') setLiveError(null);
      }
    };

    es.onerror = () => es.close();

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [enabled]);

  return { qr, liveStatus, livePhone, liveError };
}
