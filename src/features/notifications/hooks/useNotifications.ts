'use client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';
import {
  getNotificationPreferences,
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreference,
} from '../services/notificationsService';
import type { Notification, NotificationStreamEvent } from '../types';

const PAGE_SIZE = 20;

const keys = {
  unread: ['notifications', 'unread'] as const,
  list: (unreadOnly: boolean) => ['notifications', 'list', unreadOnly] as const,
  prefs: ['notifications', 'preferences'] as const,
};

export function useUnreadCount() {
  return useQuery({
    queryKey: keys.unread,
    queryFn: getUnreadCount,
    // Fallback poll so the badge stays correct even if the SSE stream drops.
    refetchInterval: 60_000,
  });
}

export function useNotificationsList(unreadOnly = false) {
  return useInfiniteQuery({
    queryKey: keys.list(unreadOnly),
    queryFn: ({ pageParam }) =>
      getNotifications({ cursor: pageParam, limit: PAGE_SIZE, unreadOnly }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1]?.id : undefined,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: keys.unread });
      qc.setQueryData(keys.unread, 0);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useNotificationPreferences() {
  return useQuery({ queryKey: keys.prefs, queryFn: getNotificationPreferences });
}

export function useUpdateNotificationPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreference,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.prefs }),
  });
}

/**
 * Opens the notifications SSE stream and keeps the unread count + list fresh.
 * Mount once (in the top bar). Hardened like the WhatsApp status stream: a
 * transient drop must NOT reset state — EventSource auto-reconnects and the
 * server re-sends the unread count on each (re)open; the polled query is the
 * fallback source of truth.
 */
export function useNotificationStream() {
  const qc = useQueryClient();

  useEffect(() => {
    const es = new EventSource('/api/v1/notifications/stream', { withCredentials: true });

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data as string) as NotificationStreamEvent;
      if (event.type === 'unread-count') {
        qc.setQueryData(keys.unread, event.count);
      } else if (event.type === 'notification') {
        qc.setQueryData<number>(keys.unread, (c) => (c ?? 0) + 1);
        // Live toast for the real event (replaces the old static demo popup).
        const n = event.notification;
        toast(n.title, n.body ? { description: n.body } : undefined);
        // Prepend to the "all" list if it's already cached.
        qc.setQueryData(keys.list(false), (old: { pages: Notification[][]; pageParams: unknown[] } | undefined) => {
          if (!old) return old;
          const [first, ...rest] = old.pages;
          return { ...old, pages: [[event.notification, ...(first ?? [])], ...rest] };
        });
        qc.invalidateQueries({ queryKey: keys.list(true) });
      }
    };

    es.onerror = () => {
      // Transient drop — let EventSource auto-reconnect; do not tear down or
      // reset. The unread-count poll covers any missed events.
    };

    return () => es.close();
  }, [qc]);
}
