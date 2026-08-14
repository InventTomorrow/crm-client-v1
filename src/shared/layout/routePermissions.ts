import type { VerticalCapability } from "@/lib/business-verticals";

// Canonical map of route prefix → required permission. Mirrors the server-side
// guards so a user who lacks a permission cannot reach the page by typing the
// URL directly (the sidebar only hides links — it does not protect routes).
// Routes not listed here require authentication only (e.g. /channels,
// /notifications which operate on the user's own context).
const ROUTE_PERMISSIONS: { prefix: string; permission: string }[] = [
  { prefix: "/inbox", permission: "conversations:view" },
  { prefix: "/leads", permission: "leads:view" },
  { prefix: "/orders", permission: "orders:view" },
  { prefix: "/inventory", permission: "inventory:view" },
  { prefix: "/menu", permission: "inventory:view" },
  { prefix: "/services", permission: "services:view" },
  { prefix: "/qualification", permission: "qualification:view" },
  { prefix: "/bookings", permission: "bookings:view" },
  { prefix: "/resources", permission: "resources:view" },
  { prefix: "/dashboard", permission: "dashboard:view" },
  { prefix: "/channels", permission: "channels:view" },
  // /settings itself is auth-only — Profile & Notifications are every user's
  // own context. Individual tabs gate themselves; the Workspaces sub-route is
  // owner/admin territory.
  // Choosing a plan is a billing action, and it's also where an expired
  // account is sent — gating it any harder would strand the owner.
  { prefix: "/pricing", permission: "billing:view" },
  { prefix: "/settings/workspaces", permission: "settings:edit" },
  { prefix: "/settings/billing", permission: "billing:view" },
  { prefix: "/settings/chatbot", permission: "chatbot:view" },
  { prefix: "/settings/business", permission: "settings:view" },
  { prefix: "/settings/usage", permission: "billing:view" },
  { prefix: "/settings/access", permission: "members:view" },
  { prefix: "/settings/system", permission: "settings:edit" },
  { prefix: "/admin", permission: "members:view" },
];

/**
 * Route prefix → the capability a workspace needs to reach it. Mirrors
 * AppSidebar's NAV_ITEMS.capability — the sidebar only hides the link, it
 * doesn't stop the route rendering for the wrong vertical after switching.
 */
const ROUTE_CAPABILITIES: { prefix: string; capability: VerticalCapability }[] = [
  { prefix: "/inventory", capability: "CATALOG_PRODUCTS" },
  { prefix: "/menu", capability: "CATALOG_MENU" },
  { prefix: "/services", capability: "CATALOG_SERVICES" },
  { prefix: "/qualification", capability: "QUALIFICATION" },
  { prefix: "/bookings", capability: "BOOKINGS" },
  { prefix: "/resources", capability: "RESOURCES" },
  { prefix: "/channels/order-api", capability: "ORDERS" },
];

/**
 * Returns the permission required for a pathname, or null when the route needs
 * authentication only. Longest matching prefix wins so nested routes inherit
 * their parent's guard.
 */
export function getRequiredPermission(pathname: string): string | null {
  const match = ROUTE_PERMISSIONS.filter(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  return match?.permission ?? null;
}

/** Returns the capability a pathname requires, or null when unrestricted. */
export function getRequiredCapability(
  pathname: string,
): VerticalCapability | null {
  const match = ROUTE_CAPABILITIES.filter(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0];

  return match?.capability ?? null;
}
