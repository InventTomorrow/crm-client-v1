'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationsList,
  useUnreadCount,
} from '../hooks/useNotifications';
import { notificationHref, notificationMeta, timeAgo } from '../lib/meta';
import { NotificationPreferences } from './NotificationPreferences';
import { Button } from '@/shared/ui/Button';

export function NotificationsView() {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { data: unread = 0 } = useUnreadCount();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotificationsList(
    tab === 'unread',
  );
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const items = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">Notifications</h1>
          <p className="text-[13px] text-[var(--ink-mute)] mt-0.5">
            {unread > 0 ? `${unread} unread` : 'You’re all caught up.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={unread === 0 || markAll.isPending}
        >
          <CheckCheck size={14} /> Mark all read
        </Button>
      </div>

      <div className="seg mb-4 w-[240px]">
        <button className={cn('flex-1', tab === 'all' ? 'on' : '')} onClick={() => setTab('all')}>
          All
        </button>
        <button className={cn('flex-1', tab === 'unread' ? 'on' : '')} onClick={() => setTab('unread')}>
          Unread ({unread})
        </button>
      </div>

      <div className="card p-0 overflow-hidden divide-y divide-[var(--line-soft)]">
        {isLoading && (
          <div className="p-10 text-center text-[var(--ink-mute)] text-[13px]">Loading…</div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="p-10 text-center text-[var(--ink-mute)] text-[13px]">
            No notifications yet.
          </div>
        )}
        {items.map((n) => {
          const { Icon, bg, color } = notificationMeta(n.type);
          return (
            <button
              key={n.id}
              onClick={() => {
                if (!n.isRead) markRead.mutate(n.id);
                router.push(notificationHref(n));
              }}
              className={cn(
                'flex items-start gap-3 w-full px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]',
                n.isRead ? 'bg-transparent' : 'bg-[var(--accent-soft)]',
              )}
            >
              <span
                className="w-9 h-9 rounded-[10px] flex-shrink-0 inline-flex items-center justify-center"
                style={{ background: bg, color }}
              >
                <Icon size={15} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13.5px] font-medium text-[var(--ink)]">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                  )}
                </div>
                {n.body && (
                  <div className="text-[12.5px] text-[var(--ink-soft)] mt-0.5 leading-[1.45]">
                    {n.body}
                  </div>
                )}
                <div className="text-[11px] text-[var(--ink-mute)] mt-1">{timeAgo(n.createdAt)} ago</div>
              </div>
            </button>
          );
        })}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? <Loader2 size={14} className="animate-spin" /> : null}
            Load more
          </Button>
        </div>
      )}

      <NotificationPreferences />
    </div>
  );
}
