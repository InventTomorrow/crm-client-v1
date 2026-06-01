'use client';
import { useState } from 'react';
import { Flame, Package, Box, Inbox, Cloud, Users, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/appStore';
import type { Notification } from '@/lib/mockData';

function iconFor(type: Notification['type']) {
  const map = {
    hot:     { Icon: Flame,   bg: 'rgba(239,68,68,0.12)',  color: '#DC2626' },
    order:   { Icon: Package, bg: 'rgba(34,197,94,0.12)',  color: '#15803D' },
    stock:   { Icon: Box,     bg: 'rgba(245,158,11,0.14)', color: '#B45309' },
    message: { Icon: Inbox,   bg: 'rgba(14,165,233,0.12)', color: '#0369A1' },
    system:  { Icon: Cloud,   bg: 'var(--accent-soft)',    color: 'var(--accent)' },
    team:    { Icon: Users,   bg: 'var(--accent-soft)',    color: 'var(--accent)' },
  } as const;
  return map[type] ?? { Icon: Bell, bg: 'var(--surface-2)', color: 'var(--ink-soft)' };
}

interface NotificationsPanelProps { onClose: () => void; }

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const router = useRouter();
  const { notifications, markNotificationRead, markAllRead } = useAppStore();
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const unread = notifications.filter(n => !n.read).length;
  const filtered = tab === 'all' ? notifications : notifications.filter(n => !n.read);

  return (
    <div className="card-2 fade-up absolute right-0 top-[calc(100%+8px)] w-[360px] z-[80] bg-[var(--surface)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-semibold">Notifications</h3>
          {unread > 0 && <span className="badge bg-[var(--accent)] text-white font-medium">{unread} new</span>}
        </div>
        <button className="btn btn-ghost py-1 px-2 text-[12px]" onClick={markAllRead}>Mark all read</button>
      </div>
      <div className="p-2 border-b border-[var(--line)]">
        <div className="seg w-full">
          <button className={cn('flex-1', tab === 'all' ? 'on' : '')} onClick={() => setTab('all')}>All ({notifications.length})</button>
          <button className={cn('flex-1', tab === 'unread' ? 'on' : '')} onClick={() => setTab('unread')}>Unread ({unread})</button>
        </div>
      </div>
      <div className="scroll max-h-[420px] overflow-y-auto">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[var(--ink-mute)] text-[13px]">All caught up.</div>
        )}
        {filtered.map(n => {
          const { Icon, bg, color } = iconFor(n.type);
          return (
            <button
              key={n.id}
              onClick={() => { markNotificationRead(n.id); if (n.type === 'hot' || n.type === 'message') { router.push('/inbox'); onClose(); } }}
              className={cn('flex items-start gap-3 w-full px-4 py-3 border-none border-b border-[var(--line-soft)] cursor-pointer text-left transition-colors hover:bg-[var(--surface-2)]', n.read ? 'bg-transparent' : 'bg-[var(--accent-soft)]')}
            >
              <span className="w-8 h-8 rounded-[10px] flex-shrink-0 inline-flex items-center justify-center" style={{ background: bg, color }}>
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--ink)]">{n.title}</span>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0" />}
                </div>
                <div className="text-[12px] text-[var(--ink-soft)] mt-0.5 leading-[1.4]">{n.body}</div>
                <div className="text-[11px] text-[var(--ink-mute)] mt-1">{n.time} ago</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-[10px] border-t border-[var(--line)] text-center">
        <button className="btn btn-ghost text-[12.5px] py-1 px-[10px]" onClick={() => { router.push('/settings'); onClose(); }}>
          Notification settings
        </button>
      </div>
    </div>
  );
}
