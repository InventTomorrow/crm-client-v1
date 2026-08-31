import type {
  BusinessVertical,
  VerticalCapability,
} from "@/lib/business-verticals";
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
  MapPin,
  Megaphone,
  MessageSquare,
  Package,
  PlayCircle,
  Settings,
  ShoppingCart,
  Stethoscope,
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
  /** Verticals that do not get this child — the page still exists, it is just redundant there. */
  hiddenForVerticals?: BusinessVertical[];
  /** Per-vertical label override — the same page, named the way that trade names it. */
  labelByVertical?: Partial<Record<BusinessVertical, string>>;
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
  /** Per-vertical label override — the same page, named the way that trade names it. */
  labelByVertical?: Partial<Record<BusinessVertical, string>>;
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
  {
    href: "/leads",
    label: "Leads",
    // A clinic tracks patients through intake, not leads through a sales pipeline.
    labelByVertical: { HEALTHCARE: "Patients" },
    Icon: Users,
    perm: "leads:view",
  },
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
    href: "/clinical-services",
    label: "Services",
    Icon: Stethoscope,
    perm: "clinical_services:view",
    capability: "CATALOG_CLINICAL",
  },
  {
    href: "/practitioners",
    label: "Practitioners",
    Icon: Stethoscope,
    perm: "practitioners:view",
    capability: "PRACTITIONERS",
  },
  {
    href: "/coverage-areas",
    label: "Coverage areas",
    Icon: MapPin,
    perm: "clinic_coverage:view",
    capability: "CLINIC_COVERAGE",
  },
  {
    href: "/qualification",
    label: "Bot questions",
    // A clinic is running patient intake, not lead qualification.
    labelByVertical: { HEALTHCARE: "Intake questions" },
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
      // A clinic's appointments are all reachable from the two pages below, so the
      // combined list is only a duplicate there.
      { href: "/bookings", label: "Appointments", hiddenForVerticals: ["HEALTHCARE"] },
      // A clinic books two different calendars — its own, and each doctor's.
      {
        href: "/bookings/clinical",
        label: "Clinical bookings",
        capability: "CATALOG_CLINICAL",
      },
      {
        href: "/bookings/doctors",
        label: "Doctor bookings",
        capability: "PRACTITIONERS",
      },
      {
        href: "/bookings/availability",
        label: "Availability",
        labelByVertical: { HEALTHCARE: "Clinic hours" },
      },
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

/** The label to show for the active workspace's vertical, falling back to the default. */
export function navLabelFor(
  item: Pick<NavItem, "label" | "labelByVertical">,
  businessVertical: BusinessVertical | undefined,
): string {
  if (!businessVertical) return item.label;
  return item.labelByVertical?.[businessVertical] ?? item.label;
}

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
