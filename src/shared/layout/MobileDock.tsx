'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, Users, Package, LayoutDashboard, Shield, Settings, ShoppingCart } from 'lucide-react';
import { useInboxUnreadCount } from '@/features/inbox/hooks/useConversations';
import { useLeadsCount } from '@/features/leads/hooks/useLeads';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCurrentTenant } from '@/features/tenant/hooks/useCurrentTenant';
import { hasCapability, type VerticalCapability } from '@/lib/business-verticals';

const DOCK_ITEMS: {
  href: string;
  label: string;
  Icon: typeof Inbox;
  perm?: string;
  /** Restricts this item to workspaces whose vertical has this capability; omit to show for all. */
  capability?: VerticalCapability;
}[] = [
  { href: '/dashboard', label: 'Home',  Icon: LayoutDashboard, perm: 'reports:view' },
  { href: '/inbox',     label: 'Inbox', Icon: Inbox,        perm: 'conversations:view' },
  { href: '/leads',     label: 'Leads', Icon: Users,        perm: 'leads:view' },
  { href: '/orders',    label: 'Orders', Icon: ShoppingCart, perm: 'orders:view', capability: 'ORDERS' },
  { href: '/inventory', label: 'Stock', Icon: Package,      perm: 'inventory:view', capability: 'CATALOG_PRODUCTS' },
  { href: '/admin',     label: 'Team',  Icon: Shield,       perm: 'members:view' },
  { href: '/settings',  label: 'More',  Icon: Settings },
];

export function MobileDock() {
  const pathname = usePathname();
  const { data: inboxUnread } = useInboxUnreadCount();
  const { data: leadsCount } = useLeadsCount();
  const { can, isLoading: permsLoading } = usePermissions();
  const { tenant } = useCurrentTenant();
  const dockItems = DOCK_ITEMS.filter(
    (it) =>
      (permsLoading || !it.perm || can(it.perm)) &&
      (!it.capability || hasCapability(tenant?.businessVertical, it.capability)),
  );
  const badgeFor = (href: string): number | undefined =>
    href === '/inbox' ? inboxUnread || undefined : href === '/leads' ? leadsCount || undefined : undefined;

  return (
    <nav className="mobile-dock">
      <div className="dock-scroll">
        {dockItems.map(it => {
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
