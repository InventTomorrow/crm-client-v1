'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Users, Package, TrendingUp, Shield, Settings, ChevronLeft, ChevronRight, Search, Sun, Moon, ChevronDown, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/appStore';
import { CRMAvatar } from '@/shared/ui/CRMAvatar';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { ProfileMenu } from './ProfileMenu';
import { useMe } from '@/features/auth/hooks/useAuth';
import { useInboxUnreadCount } from '@/features/inbox/hooks/useConversations';
import { useLeadsCount } from '@/features/leads/hooks/useLeads';

const NAV_ITEMS = [
  { href: '/inbox',     label: 'Inbox',         Icon: Inbox },
  { href: '/leads',     label: 'Leads',         Icon: Users },
  { href: '/inventory', label: 'Inventory',     Icon: Package },
  { href: '/channels',  label: 'Channels',      Icon: Wifi },
  { href: '/analytics', label: 'Analytics',     Icon: TrendingUp },
  { href: '/admin',     label: 'Team & Access', Icon: Shield },
  { href: '/settings',  label: 'Settings',      Icon: Settings },
];

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({ mobileOpen, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useAppStore();
  const { user } = useMe();
  const { data: inboxUnread } = useInboxUnreadCount();
  const { data: leadsCount } = useLeadsCount();
  const badgeFor = (href: string): number | undefined =>
    href === '/inbox' ? inboxUnread || undefined : href === '/leads' ? leadsCount || undefined : undefined;
  const [profileOpen, setProfileOpen] = useState(false);
  const collapsed = sidebarCollapsed;

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element)?.closest?.('[data-header-popover]')) return;
      setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [profileOpen]);

  const width = collapsed ? 68 : 232;
  const profileName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : '';
  const profileEmail = user?.email || '';

  return (
    <>
      {mobileOpen && (
        <div className="scrim show-mobile-only" onClick={onCloseMobile} />
      )}
      <aside
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{ width, transition: 'width 240ms cubic-bezier(.22,.9,.4,1), transform 260ms cubic-bezier(.22,.9,.4,1)' }}
      >
        {/* Logo + collapse */}
        <div className={cn('flex items-center gap-2.5', collapsed ? 'justify-center px-0 pt-[14px] pb-1.5' : 'justify-between px-[14px] pt-[14px] pb-1.5')}>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-[26px] h-[26px] rounded-[7px] bg-[linear-gradient(90deg,#4FC3F7,#7C3AED)] flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 14 L10 8 L14 12 L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            {!collapsed && (
              <span className="font-[var(--font-head)] font-semibold text-[13.5px] tracking-[-0.01em] text-[var(--ink)]">
                SaleFlow <span className="text-[var(--ink-mute)] font-medium text-[10.5px] tracking-[0.16em] ml-1">CRM</span>
              </span>
            )}
          </div>
          {!collapsed && (
            <button className="btn btn-ghost hide-mobile p-1" onClick={toggleSidebar} title="Collapse sidebar">
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        <WorkspaceSwitcher collapsed={collapsed} />

        {/* Search shortcut */}
        {!collapsed && (
          <div className="px-[14px] pb-[10px]">
            <button className="btn btn-outline w-full justify-start gap-2 text-[var(--ink-mute)] font-normal text-[12.5px]">
              <Search size={14} />
              <span>Search</span>
              <span className="ml-auto font-[var(--font-mono)] text-[10.5px] text-[var(--ink-mute)]">⌘K</span>
            </button>
          </div>
        )}

        {/* Nav items */}
        <nav className={cn('flex flex-col gap-0.5 flex-1', collapsed ? 'px-[10px] py-1' : 'px-3 py-1')}>
          {!collapsed && (
            <div className="text-[10px] text-[var(--ink-mute)] uppercase tracking-[0.12em] font-semibold px-3 pt-[10px] pb-1.5">Workspace</div>
          )}
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            const badge = badgeFor(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn('nav-item no-underline', collapsed ? 'justify-center p-[10px]' : 'justify-start px-3 py-2', active ? 'active' : '')}
              >
                <item.Icon size={17} className={cn('nav-ic flex-shrink-0', active ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]')} />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && !!badge && (
                  <span className={cn('badge font-medium py-[1px] px-[7px] min-w-5 justify-center', active ? 'bg-[var(--accent)] text-white border-none' : 'bg-[var(--surface-2)] text-[var(--ink-soft)] border border-[var(--line)]')}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 flex flex-col gap-2.5 border-t border-[var(--line)] relative">
          {!collapsed ? (
            <div className="theme-seg">
              <button className={theme !== 'dark' ? 'on' : ''} onClick={() => theme === 'dark' && toggleTheme()}>
                <Sun size={13} /> Light
              </button>
              <button className={theme === 'dark' ? 'on' : ''} onClick={() => theme !== 'dark' && toggleTheme()}>
                <Moon size={13} /> Dark
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost justify-center p-2" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          )}

          {/* Profile */}
          <div data-header-popover className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className={cn(
                'flex items-center gap-2.5 w-full rounded-lg cursor-pointer border border-transparent font-[inherit] transition-colors hover:bg-[var(--surface-2)]',
                collapsed ? 'justify-center p-1' : 'justify-start px-2 py-1.5',
                profileOpen ? 'bg-[var(--surface-2)]' : 'bg-transparent',
              )}
            >
              <CRMAvatar name={profileName} size={28} />
              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[12.5px] font-medium text-[var(--ink)]">{profileName}</div>
                    <div className="text-[10.5px] text-[var(--ink-mute)] truncate">{profileEmail}</div>
                  </div>
                  <ChevronDown size={13} className="text-[var(--ink-mute)]" />
                </>
              )}
            </button>
            {profileOpen && (
              <div className={cn('absolute bottom-[calc(100%+8px)] z-[80]', collapsed ? 'left-[calc(100%+8px)]' : 'left-0 right-0')}>
                <ProfileMenu onClose={() => setProfileOpen(false)} />
              </div>
            )}
          </div>

          {collapsed && (
            <button className="btn btn-ghost justify-center p-2" onClick={toggleSidebar} title="Expand">
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
