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
  { prefix: "/dashboard", permission: "reports:view" },
  { prefix: "/channels", permission: "channels:view" },
  // /settings itself is auth-only — Profile & Notifications are every user's
  // own context. Individual tabs gate themselves; the Workspaces sub-route is
  // owner/admin territory.
  { prefix: "/settings/workspaces", permission: "settings:edit" },
  { prefix: "/admin", permission: "members:view" },
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
