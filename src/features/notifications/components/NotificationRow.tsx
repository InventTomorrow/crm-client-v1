'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useMarkNotificationRead } from '../hooks/useNotifications';
import { notificationHref, notificationMeta, timeAgo } from '../lib/meta';
import type { Notification } from '../types';

export function NotificationRow({ notification }: { notification: Notification }) {
  const { Icon, bg, color } = notificationMeta(notification.type);
  const markRead = useMarkNotificationRead();

  return (
    <Link
      href={notificationHref(notification)}
      onClick={() => {
        if (!notification.isRead) markRead.mutate(notification.id);
      }}
      className={cn(
        'flex items-start gap-3 w-full px-4 py-3.5 text-left transition-colors hover:bg-[var(--surface-2)]',
        notification.isRead ? 'bg-transparent' : 'bg-[var(--accent-soft)]',
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
          <span className="text-[13.5px] font-medium text-[var(--ink)]">{notification.title}</span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />
          )}
        </div>
        {notification.body && (
          <div className="text-[12.5px] text-[var(--ink-soft)] mt-0.5 leading-[1.45]">
            {notification.body}
          </div>
        )}
      </div>
      <span className="text-[11px] text-[var(--ink-mute)] flex-shrink-0">
        {timeAgo(notification.createdAt)}
      </span>
    </Link>
  );
}
