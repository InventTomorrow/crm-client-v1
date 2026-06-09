'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Bell } from 'lucide-react';
import { useAppStore } from '@/lib/appStore';
import { useNotificationStream, useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { NotificationsPanel } from './NotificationsPanel';
import { SearchPalette } from './SearchPalette';

const TITLES: Record<string, string> = {
  '/inbox':     'Unified Inbox',
  '/leads':     'Leads',
  '/inventory': 'Inventory',
  '/analytics': 'Analytics',
  '/admin':     'Team & Access',
  '/notifications': 'Notifications',
  '/settings':  'Settings',
};

interface AppTopBarProps {
  onMobileMenu: () => void;
}

export function AppTopBar({ onMobileMenu }: AppTopBarProps) {
  const pathname = usePathname();
  const { workspaces, currentWorkspaceId } = useAppStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Live unread badge — SSE stream keeps it fresh, polled query is the fallback.
  useNotificationStream();
  const { data: unread = 0 } = useUnreadCount();
  const ws = workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0];
  const title = Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ?? 'SaleFlow';

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('[data-header-popover]')) return;
      setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [notifOpen]);

  return (
    <header className="h-14 flex-shrink-0 px-[18px] flex items-center gap-3.5 border-b border-[var(--line)] bg-[var(--surface)] relative z-30">
      <button className="btn btn-ghost show-mobile-only p-1.5" onClick={onMobileMenu}>
        <Menu size={20} />
      </button>
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        <div className="text-[11px] text-[var(--ink-mute)] flex items-center gap-1.5">
          <span>{ws?.name ?? 'SaleFlow Boutique'}</span>
          <span>·</span>
          <span>{ws?.plan ?? 'Tier 3'}</span>
        </div>
      </div>
      <div className="flex-1" />

      {/* Desktop search */}
      <button
        onClick={() => setSearchOpen(true)}
        className="hide-mobile topbar-search-btn flex items-center gap-2.5 px-3 py-[7px] rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-mute)] text-[12.5px] cursor-pointer min-w-[280px]"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search leads, products, orders...</span>
        <span className="font-[var(--font-mono)] text-[10.5px] px-[5px] py-px border border-[var(--line)] rounded">⌘K</span>
      </button>

      {/* Mobile search */}
      <button className="btn btn-ghost show-mobile-only p-2" onClick={() => setSearchOpen(true)}>
        <Search size={17} />
      </button>

      {/* Notifications */}
      <div data-header-popover className="relative">
        <button
          className="btn btn-ghost relative p-2"
          onClick={e => { e.stopPropagation(); setNotifOpen(v => !v); }}
        >
          <Bell size={17} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-[#EF4444] text-white text-[9.5px] font-semibold border-2 border-[var(--surface)] inline-flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
      </div>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
