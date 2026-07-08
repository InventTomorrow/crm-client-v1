'use client';
import {
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
 * Folds a notification SSE event into the unread-count + list caches and
 * raises the live toast. Called by useAppEvents for every notification event.
 */
export function applyNotificationEvent(
  qc: QueryClient,
  event: NotificationStreamEvent,
): void {
  if (event.type === 'unread-count') {
    qc.setQueryData(keys.unread, event.count);
  } else if (event.type === 'notification') {
    qc.setQueryData<number>(keys.unread, (c) => (c ?? 0) + 1);
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
}
