import {
  Bell,
  Flame,
  Inbox,
  LogIn,
  Megaphone,
  Package,
  CreditCard,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Notification, NotificationType } from '../types';

interface Meta {
  Icon: typeof Bell;
  bg: string;
  color: string;
}

/** Icon + token-based colors per notification type (no hardcoded theme colors). */
export function notificationMeta(type: NotificationType): Meta {
  const map: Record<NotificationType, Meta> = {
    NEW_MESSAGE: { Icon: Inbox, bg: 'rgba(14,165,233,0.12)', color: '#0369A1' },
    CHAT_ESCALATED: { Icon: Flame, bg: 'rgba(239,68,68,0.12)', color: '#DC2626' },
    NEW_LEAD: { Icon: Users, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    LEAD_ASSIGNED: { Icon: Users, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    ORDER_CREATED: { Icon: Package, bg: 'rgba(34,197,94,0.12)', color: '#15803D' },
    ORDER_STATUS_CHANGED: { Icon: Package, bg: 'rgba(245,158,11,0.14)', color: '#B45309' },
    MEMBER_INVITED: { Icon: UserPlus, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    MEMBER_JOINED: { Icon: UserPlus, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    BROADCAST_COMPLETED: { Icon: Megaphone, bg: 'var(--accent-soft)', color: 'var(--accent)' },
    NEW_LOGIN: { Icon: LogIn, bg: 'var(--surface-2)', color: 'var(--ink-soft)' },
    BILLING: { Icon: CreditCard, bg: 'var(--surface-2)', color: 'var(--ink-soft)' },
  };
  return map[type] ?? { Icon: Bell, bg: 'var(--surface-2)', color: 'var(--ink-soft)' };
}

/** Resolves the in-app destination for a notification from its `data` payload. */
export function notificationHref(n: Notification): string {
  const data = (n.data ?? {}) as Record<string, unknown>;
  switch (n.type) {
    case 'NEW_MESSAGE':
    case 'CHAT_ESCALATED':
      return '/inbox';
    case 'NEW_LEAD':
    case 'LEAD_ASSIGNED':
      return '/leads';
    case 'ORDER_CREATED':
    case 'ORDER_STATUS_CHANGED':
      return typeof data.orderId === 'string' ? `/orders?id=${data.orderId}` : '/orders';
    case 'MEMBER_INVITED':
    case 'MEMBER_JOINED':
      return '/admin';
    case 'NEW_LOGIN':
    case 'BILLING':
      return '/settings';
    default:
      return '/notifications';
  }
}

/** Compact relative time, e.g. "3m", "2h", "5d". */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
}
