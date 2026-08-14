import type { VerticalCapability } from "@/lib/business-verticals";
import {
  Bell,
  Building2,
  CalendarClock,
  ClipboardList,
  CreditCard,
  Crown,
  FolderOpen,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Package,
  PlayCircle,
  Settings,
  ShoppingCart,
  User,
  Users,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

export interface NavChild {
  href: string;
  label: string;
  perm?: string;
  /** Restricts this child to workspaces whose vertical has this capability; omit to show for all. */
  capability?: VerticalCapability;
  /** Optional leading icon — sections without one render label-only children. */
  Icon?: typeof Inbox;
}

export interface NavItem {
  href: string;
  label: string;
  Icon: typeof Inbox;
  perm?: string;
  /** Restricts this item to workspaces whose vertical has this capability; omit to show for all. */
  capability?: VerticalCapability;
  /** Sibling pages under this section. Only listed where a section has real destinations —
   * form routes like /services/new are reached from the page, not the sidebar. */
  children?: NavChild[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    perm: "dashboard:view",
  },
  { href: "/inbox", label: "Inbox", Icon: Inbox, perm: "conversations:view" },
  { href: "/leads", label: "Leads", Icon: Users, perm: "leads:view" },
  {
    href: "/orders",
    label: "Orders",
    Icon: ShoppingCart,
    perm: "orders:view",
    capability: "ORDERS",
  },
  {
    href: "/inventory",
    label: "Inventory",
    Icon: Package,
    perm: "inventory:view",
    capability: "CATALOG_PRODUCTS",
  },
  {
    href: "/menu",
    label: "Menu",
    Icon: UtensilsCrossed,
    perm: "inventory:view",
    capability: "CATALOG_MENU",
    children: [
      { href: "/menu", label: "All items" },
      { href: "/menu/categories", label: "Categories" },
      { href: "/menu/cards", label: "Menu cards" },
    ],
  },
  {
    href: "/services",
    label: "Services",
    Icon: Megaphone,
    perm: "services:view",
    capability: "CATALOG_SERVICES",
    // children: [
    //   { href: '/services', label: 'All services' },
    //   { href: '/services/plans', label: 'Plans & pricing' },
    // ],
  },
  {
    href: "/qualification",
    label: "Bot questions",
    Icon: ClipboardList,
    perm: "qualification:view",
    capability: "QUALIFICATION",
  },
  {
    href: "/bookings",
    label: "Bookings",
    Icon: CalendarClock,
    perm: "bookings:view",
    capability: "BOOKINGS",
    children: [
      { href: "/bookings", label: "Appointments" },
      { href: "/bookings/availability", label: "Availability" },
    ],
  },
  {
    href: "/resources",
    label: "Resources",
    Icon: FolderOpen,
    perm: "resources:view",
    capability: "RESOURCES",
  },
  {
    href: "/channels",
    label: "Channels",
    Icon: Wifi,
    perm: "channels:view",
    // children: [
    //   { href: "/channels", label: "Overview" },
    //   { href: "/channels/whatsapp", label: "WhatsApp" },
    //   // Ingests website orders — nothing to ingest in a vertical without ORDERS.
    //   { href: "/channels/order-api", label: "Order API", capability: "ORDERS" },
    // ],
  },
  // Auth-only — a user's own notification feed. Delivery preferences live under Settings.
  // { href: "/notifications", label: "Notifications", Icon: Bell },
  // Settings is auth-only — every user can reach their Profile; the inner tabs
  // gate themselves by permission.
  {
    href: "/settings",
    label: "Settings",
    Icon: Settings,
    children: [
      {
        href: "/settings/profile",
        label: "Profile",
        Icon: User,
      },
      {
        href: "/settings/chatbot",
        label: "Chatbot",
        perm: "chatbot:view",
        Icon: MessageSquare,
      },
      {
        href: "/settings/business",
        label: "Business",
        perm: "settings:view",
        Icon: Building2,
      },
      // Channels tab hidden — the WhatsApp channel page owns connect/disconnect now.
      // { href: '/settings/channels', label: 'Channels', perm: 'channels:view', Icon: Wifi },
      {
        href: "/settings/notifications",
        label: "Notifications",
        Icon: Bell,
      },
      {
        href: "/settings/billing",
        label: "Billing & Plan",
        perm: "billing:view",
        Icon: CreditCard,
      },
      {
        href: "/settings/usage",
        label: "Usage",
        perm: "billing:view",
        Icon: Crown,
      },
      {
        href: "/settings/access",
        label: "Access Control",
        perm: "members:view",
        Icon: KeyRound,
      },
      {
        href: "/settings/workspaces",
        label: "Workspaces",
        perm: "settings:edit",
        Icon: LayoutGrid,
      },
    ],
  },
  // {
  //   href: "/admin",
  //   label: "Team & Access",
  //   Icon: ShieldCheck,
  //   perm: "members:view",
  // },
  { href: "/demo", label: "Demo", Icon: PlayCircle },
];

/** The child a pathname belongs to, by longest matching href — so /services/plans resolves to
 * "Plans & pricing" rather than to "All services", which also prefix-matches. */
export function findActiveChildHref(
  children: NavChild[],
  pathname: string,
): string | undefined {
  return children
    .filter(
      (child) =>
        pathname === child.href || pathname.startsWith(`${child.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
