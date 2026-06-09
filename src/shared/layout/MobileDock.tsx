'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Users, Package, TrendingUp, Shield, Settings, ShoppingCart } from 'lucide-react';
import { useInboxUnreadCount } from '@/features/inbox/hooks/useConversations';
import { useLeadsCount } from '@/features/leads/hooks/useLeads';

const DOCK_ITEMS = [
  { href: '/inbox',     label: 'Inbox', Icon: Inbox },
  { href: '/leads',     label: 'Leads', Icon: Users },
  { href: '/orders',    label: 'Orders', Icon: ShoppingCart },
  { href: '/inventory', label: 'Stock', Icon: Package },
  { href: '/analytics', label: 'Stats', Icon: TrendingUp },
  { href: '/admin',     label: 'Team',  Icon: Shield },
  { href: '/settings',  label: 'More',  Icon: Settings },
];

export function MobileDock() {
  const pathname = usePathname();
  const { data: inboxUnread } = useInboxUnreadCount();
  const { data: leadsCount } = useLeadsCount();
  const badgeFor = (href: string): number | undefined =>
    href === '/inbox' ? inboxUnread || undefined : href === '/leads' ? leadsCount || undefined : undefined;

  return (
    <nav className="mobile-dock">
      <div className="dock-scroll">
        {DOCK_ITEMS.map(it => {
          const active = pathname.startsWith(it.href);
          const badge = badgeFor(it.href);
          return (
            <Link key={it.href} href={it.href} className={`dock-item no-underline ${active ? 'active' : ''}`}>
              <it.Icon size={18} />
              <span className="dock-lbl">{it.label}</span>
              {!!badge && <span className="dock-badge">{badge > 99 ? '99+' : badge}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
