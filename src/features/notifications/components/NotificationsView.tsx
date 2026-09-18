'use client';
import { useCurrentTenant } from '@/features/tenant/hooks/useCurrentTenant';
import { hasCapability } from '@/lib/business-verticals';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { RefreshButton } from '@/shared/ui/RefreshButton';
import { BellOff, CheckCheck, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMarkAllRead, useNotificationsList, useUnreadCount } from '../hooks/useNotifications';
import { NotificationRow } from './NotificationRow';

type NotificationsTab = 'all' | 'unread' | 'orders';

const EMPTY_TEXT: Record<NotificationsTab, string> = {
  all: 'No notifications yet.',
  unread: 'No unread notifications.',
  orders: 'No orders yet. Orders the assistant closes in chat appear here.',
};

export function NotificationsView() {
  const [tab, setTab] = useState<NotificationsTab>('all');
  const { tenant } = useCurrentTenant();
  // Orders closed in chat are read here for now, and every inbound message also
  // lands in this feed — so they get a tab of their own rather than being buried.
  const showOrders = !!tenant && hasCapability(tenant.businessVertical, 'SERVICE_ORDERS');
  const { data: unread = 0 } = useUnreadCount();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useNotificationsList(tab === 'unread', tab === 'orders' ? 'SERVICE_ORDER_PLACED' : undefined);
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
        <div className="flex items-center gap-2">
          <RefreshButton
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
            size="icon-sm"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={unread === 0 || markAll.isPending}
          >
            <CheckCheck size={14} /> Mark all read
          </Button>
        </div>
      </div>

      <div className={cn('seg mb-4', showOrders ? 'w-[340px] max-w-full' : 'w-[240px]')}>
        <button className={cn('flex-1', tab === 'all' ? 'on' : '')} onClick={() => setTab('all')}>
          All
        </button>
        <button
          className={cn('flex-1', tab === 'unread' ? 'on' : '')}
          onClick={() => setTab('unread')}
        >
          Unread ({unread})
        </button>
        {showOrders && (
          <button
            className={cn('flex-1', tab === 'orders' ? 'on' : '')}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden divide-y divide-[var(--line-soft)]">
        {isLoading && (
          <div className="p-10 text-center text-[var(--ink-mute)] text-[13px]">Loading…</div>
        )}
        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--ink-mute)]">
            <BellOff size={26} />
            <p className="text-[13px]">{EMPTY_TEXT[tab]}</p>
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
