'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { BellOff, CheckCheck, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMarkAllRead, useNotificationsList, useUnreadCount } from '../hooks/useNotifications';
import { NotificationRow } from './NotificationRow';

export function NotificationsView() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { data: unread = 0 } = useUnreadCount();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useNotificationsList(
    tab === 'unread',
  );
  const markAll = useMarkAllRead();

  const notifications = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <div className="max-w-6xl">
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
        <button
          className={cn('flex-1', tab === 'unread' ? 'on' : '')}
          onClick={() => setTab('unread')}
        >
          Unread ({unread})
        </button>
      </div>

      <div className="card p-0 overflow-hidden divide-y divide-[var(--line-soft)]">
        {isLoading && (
          <div className="p-10 text-center text-[var(--ink-mute)] text-[13px]">Loading…</div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--ink-mute)]">
            <BellOff size={26} />
            <p className="text-[13px]">
              {tab === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
            </p>
          </div>
        )}
        {notifications.map((notification) => (
          <NotificationRow key={notification.id} notification={notification} />
        ))}
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
    </div>
  );
}
