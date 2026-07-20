"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

/**
 * Renders `children` only when the active role holds the given permission.
 * Use to hide mutating actions (create / edit / delete / export buttons) from
 * roles that lack them. The server still enforces every mutation — this is a
 * UX layer, not the security boundary.
 *
 * While permissions are loading nothing renders, so actions never flash for a
 * role that shouldn't see them.
 */
export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, isLoading } = usePermissions();
  if (isLoading) return null;
  return <>{can(permission) ? children : fallback}</>;
}
