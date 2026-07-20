"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import type { UserResponse } from "@/features/auth/types";
import { useAppStore } from "@/lib/appStore";
import { useEffect } from "react";

/**
 * Resolve the tenant the server is currently serving. `/me` surfaces the active
 * membership's role at the top level, and role ids are unique per tenant — so
 * this pinpoints the workspace the session JWT is scoped to.
 */
function resolveServerActiveTenantId(
  user: UserResponse | undefined,
): string | null {
  if (!user) return null;
  const memberships = user.memberships ?? [];
  const active =
    memberships.find((m) => m.role.id === user.roleId) ?? memberships[0];
  return active?.tenant.id ?? null;
}

export function useSyncActiveWorkspace() {
  const { user } = useMe();
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);
  const setCurrentWorkspace = useAppStore((s) => s.setCurrentWorkspace);
  const isSwitchingWorkspace = useAppStore((s) => s.isSwitchingWorkspace);

  const serverActiveId = resolveServerActiveTenantId(user);

  useEffect(() => {
    // Don't fight an in-flight switch — that flow updates the store itself.
    if (!serverActiveId || isSwitchingWorkspace) return;
    if (serverActiveId !== currentWorkspaceId) {
      setCurrentWorkspace(serverActiveId);
    }
  }, [
    serverActiveId,
    currentWorkspaceId,
    isSwitchingWorkspace,
    setCurrentWorkspace,
  ]);
}
