'use client';
import { useMemo } from 'react';
import { useMe } from './useAuth';

/**
 * Reads the current user's active-role permissions (from /auth/me) and exposes
 * a `can()` check. OWNER is granted everything regardless of the stored list.
 */
export function usePermissions() {
  const { user, isLoading } = useMe();

  const permissions = useMemo(() => new Set(user?.permissions ?? []), [user?.permissions]);
  const isOwner = user?.roleName === 'OWNER';

  const can = (permission: string): boolean => {
    if (isOwner) return true;
    return permissions.has(permission);
  };

  return { can, isOwner, roleName: user?.roleName ?? null, permissions, isLoading };
}
