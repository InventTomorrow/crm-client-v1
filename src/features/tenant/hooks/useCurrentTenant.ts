'use client';
import { useMe } from '@/features/auth/hooks/useAuth';
import { useAppStore } from '@/lib/appStore';

/**
 * The tenant object for the workspace currently active in the JWT session
 * (kept in sync onto `currentWorkspaceId` by useSyncActiveWorkspace). Single
 * join point for "what vertical / plan / status is the active tenant" —
 * components should read this instead of re-deriving the membership lookup.
 */
export function useCurrentTenant() {
  const { user, isLoading } = useMe();
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);

  const tenant = user?.memberships.find((m) => m.tenant.id === currentWorkspaceId)?.tenant ?? null;

  return { tenant, isLoading };
}
