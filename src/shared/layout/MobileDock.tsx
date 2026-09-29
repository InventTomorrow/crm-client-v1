'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  CalendarClock,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { useInboxUnreadCount } from '@/features/inbox/hooks/useConversations';
import { useLeadsCount } from '@/features/leads/hooks/useLeads';
import { usePendingOrdersCount } from '@/features/orders/hooks/useOrders';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCurrentTenant } from '@/features/tenant/hooks/useCurrentTenant';
import {
  hasCapability,
  type BusinessVertical,
  type VerticalCapability,
} from '@/lib/business-verticals';
import { formatNavBadge, navLabelFor } from './navItems';

interface DockItem {
  href: string;
  label: string;
  Icon: typeof Inbox;
  perm?: string;
  /** Restricts this item to workspaces whose vertical has this capability; omit to show for all. */
  capability?: VerticalCapability;
  /** Per-vertical label override — see navLabelFor. */
  labelByVertical?: Partial<Record<BusinessVertical, string>>;
}

// Each vertical gets its own primary workspace tab (Stock / Menu / Bookings) between the shared ones.
const DOCK_ITEMS: DockItem[] = [
  { href: '/dashboard', label: 'Home', Icon: LayoutDashboard, perm: 'dashboard:view' },
  { href: '/inbox', label: 'Inbox', Icon: Inbox, perm: 'conversations:view' },
  { href: '/leads', label: 'Leads', Icon: Users, perm: 'leads:view', labelByVertical: { HEALTHCARE: 'Patients' } },
  { href: '/orders', label: 'Orders', Icon: ShoppingCart, perm: 'orders:view', capability: 'ORDERS' },
  { href: '/service-orders', label: 'Orders', Icon: ShoppingCart, perm: 'orders:view', capability: 'SERVICE_ORDERS' },
  { href: '/inventory', label: 'Stock', Icon: Package, perm: 'inventory:view', capability: 'CATALOG_PRODUCTS' },
  { href: '/menu', label: 'Menu', Icon: UtensilsCrossed, perm: 'inventory:view', capability: 'CATALOG_MENU' },
  { href: '/bookings', label: 'Bookings', Icon: CalendarClock, perm: 'bookings:view', capability: 'BOOKINGS' },
  { href: '/settings/access', label: 'Team', Icon: Shield, perm: 'members:view' },
  { href: '/settings', label: 'More', Icon: Settings },
];

export function MobileDock() {
  const pathname = usePathname();
  const dockScrollRef = useRef<HTMLDivElement>(null);
  const { data: inboxUnread } = useInboxUnreadCount();
  const { data: leadsCount } = useLeadsCount();
  const { data: pendingOrders } = usePendingOrdersCount();
  const { can, isLoading: permsLoading } = usePermissions();
  const { tenant } = useCurrentTenant();
  const visibleDockItems = DOCK_ITEMS.filter(
    (dockItem) =>
      (permsLoading || !dockItem.perm || can(dockItem.perm)) &&
      (!dockItem.capability || hasCapability(tenant?.businessVertical, dockItem.capability)),
  );
  // Longest match wins so /settings/access lights "Team", not "More" as well.
  const activeHref = visibleDockItems
    .filter((dockItem) => pathname.startsWith(dockItem.href))
    .reduce<string | undefined>(
      (longestHref, dockItem) =>
        !longestHref || dockItem.href.length > longestHref.length ? dockItem.href : longestHref,
      undefined,
    );

  const getBadgeCountForHref = (href: string): number | undefined => {
    if (href === '/inbox') return inboxUnread || undefined;
    if (href === '/leads') return leadsCount || undefined;
    if (href === '/orders' || href === '/service-orders') return pendingOrders || undefined;
    return undefined;
  };

  // When the dock overflows, keep the active tab on screen instead of scrolled out of view.
  useEffect(() => {
    dockScrollRef.current
      ?.querySelector('.dock-item.active')
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }, [activeHref]);

  return (
    <nav className="mobile-dock">
      <div ref={dockScrollRef} className="dock-scroll">
        {visibleDockItems.map((dockItem) => {
          const isActive = dockItem.href === activeHref;
          const badgeCount = getBadgeCountForHref(dockItem.href);
          return (
            <Link
              key={dockItem.href}
              href={dockItem.href}
              aria-current={isActive ? 'page' : undefined}
              className={`dock-item no-underline ${isActive ? 'active' : ''}`}
            >
              <dockItem.Icon size={18} />
              <span className="dock-lbl">{navLabelFor(dockItem, tenant?.businessVertical)}</span>
              {!!badgeCount && <span className="dock-badge">{formatNavBadge(badgeCount)}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
