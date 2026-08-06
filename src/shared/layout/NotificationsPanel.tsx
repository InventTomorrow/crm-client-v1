'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  useMarkAllRead,
  useMarkNotificationRead,
  useNotificationsList,
  useUnreadCount,
} from '@/features/notifications/hooks/useNotifications';
import { notificationHref, notificationMeta, timeAgo } from '@/features/notifications/lib/meta';
import {
  useMyInvitations,
  useAcceptMyInvitation,
  useDeclineMyInvitation,
} from '@/features/auth/hooks/useAuth';
import type { MyInvitationItem } from '@/features/auth/services/authService';
import { Button } from '@/shared/ui/Button';

interface NotificationsPanelProps {
  onClose: () => void;
}

function PendingInvites() {
  const { data: invites = [] as MyInvitationItem[] } = useMyInvitations();
  const accept = useAcceptMyInvitation();
  const decline = useDeclineMyInvitation();
  const busy = accept.isPending || decline.isPending;

  if (invites.length === 0) return null;

  return (
    <div className="border-b border-[var(--line)] bg-[var(--surface-2)]">
      <div className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
        Workspace invites
      </div>
      {invites.map((inv: MyInvitationItem) => (
        <div key={inv.id} className="px-4 py-3 flex flex-col gap-2 border-b border-[var(--line-soft)] last:border-b-0">
          <div className="text-[13px] text-[var(--ink)] leading-snug">
            <span className="inline-flex items-center gap-1.5">
              <strong>{inv.tenantName ?? 'A workspace'}</strong>
              {inv.expired && (
                <span className="badge bg-[var(--surface-2)] text-[var(--ink-mute)] text-[10.5px]">Expired</span>
              )}
            </span>
            {' · '}
            <span className="text-[var(--ink-soft)]">{inv.roleName}</span>
            {inv.invitedByName && (
              <div className="text-[11.5px] text-[var(--ink-mute)] mt-0.5">Invited by {inv.invitedByName}</div>
            )}
          </div>
          {inv.expired ? (
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] text-[var(--ink-mute)]">
                This invite expired. Ask your admin to resend it.
              </span>
              <Button size="sm" variant="ghost" className="ml-auto" disabled={busy} onClick={() => decline.mutate(inv.id)}>
                Dismiss
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" disabled={busy} onClick={() => accept.mutate({ id: inv.id, tenantId: inv.tenantId, tenantName: inv.tenantName })}>
                Accept
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => decline.mutate(inv.id)}>
                Decline
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { data: unread = 0 } = useUnreadCount();
  const { data, isLoading } = useNotificationsList(tab === 'unread');
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllRead();

  const items = useMemo(() => data?.pages.flat() ?? [], [data]);

  return (
    <div className="w-full overflow-hidden bg-[var(--surface)]">
      <PendingInvites />
      <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold">Notifications</h3>
          {unread > 0 && (
            <span className="badge bg-[var(--accent)] text-white font-medium">{unread} new</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAll.mutate()}
          disabled={unread === 0 || markAll.isPending}
        >
          Mark all read
        </Button>
      </div>

      <div className="p-2 border-b border-[var(--line)]">
        <div className="seg w-full">
          <button className={cn('flex-1', tab === 'all' ? 'on' : '')} onClick={() => setTab('all')}>
            All
          </button>
          <button className={cn('flex-1', tab === 'unread' ? 'on' : '')} onClick={() => setTab('unread')}>
            Unread ({unread})
          </button>
        </div>
      </div>

      <div className="scroll max-h-[420px] overflow-y-auto">
        {isLoading && (
          <div className="p-8 text-center text-[var(--ink-mute)] text-[13px]">Loading…</div>
        )}
        {!isLoading && items.length === 0 && (
          <div className="p-8 text-center text-[var(--ink-mute)] text-[13px]">All caught up.</div>
        )}
        {items.map((n) => {
          const { Icon, bg, color } = notificationMeta(n.type);
          return (
            <button
              key={n.id}
              onClick={() => {
                if (!n.isRead) markRead.mutate(n.id);
                router.push(notificationHref(n));
                onClose();
              }}
              className={cn(
                'flex items-start gap-3 w-full px-4 py-3 border-none border-b border-[var(--line-soft)] cursor-pointer text-left transition-colors hover:bg-[var(--surface-2)]',
                n.isRead ? 'bg-transparent' : 'bg-[var(--accent-soft)]',
              )}
            >
              <span
                className="w-8 h-8 rounded-[10px] flex-shrink-0 inline-flex items-center justify-center"
                style={{ background: bg, color }}
              >
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--ink)]">{n.title}</span>
                  {!n.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
                  )}
                </div>
                {n.body && (
                  <div className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-[1.4] line-clamp-2">
                    {n.body}
                  </div>
                )}
                <div className="text-[11px] text-[var(--ink-mute)] mt-1">{timeAgo(n.createdAt)} ago</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-[10px] border-t border-[var(--line)] text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            router.push('/notifications');
            onClose();
          }}
        >
          View all notifications
        </Button>
      </div>
    </div>
  );
}
