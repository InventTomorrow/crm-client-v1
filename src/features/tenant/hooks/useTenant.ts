"use client";
import {
  getLeftMembers,
  getMe,
  leaveWorkspace,
  switchWorkspace,
} from "@/features/auth/services/authService";
import { useAppStore } from "@/lib/appStore";
import type { BusinessVertical } from "@/lib/business-verticals";
import { extractApiErrorCode, extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createTenant,
  deleteTenant,
  getMyWorkspaceStats,
  getTenants,
  restoreTenant,
  updateTenant,
} from "../services/tenantService";
import type { CreateTenantPayload } from "../types";

/** Fetch all tenants the current user has access to */
export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
    staleTime: 2 * 60 * 1000,
  });
}

/** Headline counters (leads, members, revenue, appointments) per workspace the user belongs to */
export function useMyWorkspaceStats() {
  return useQuery({
    queryKey: ["workspace-stats"],
    queryFn: getMyWorkspaceStats,
    staleTime: 2 * 60 * 1000,
  });
}

/** Create a new workspace, then immediately switch into it */
export function useCreateTenant() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setCurrentWorkspace, setWorkspaceSwitching } = useAppStore();

  return useMutation({
    mutationFn: (data: CreateTenantPayload) => createTenant(data),
    onSuccess: async (tenant) => {
      toast.success(`Workspace "${tenant.name}" created!`);
      setWorkspaceSwitching(true, tenant.name);
      try {
        // Switch first — the new membership already exists server-side by the
        // time createTenant resolves, and switching rotates the JWT cookies to
        // scope them to the new tenant.
        await switchWorkspace(tenant.id);

        // Wipe all cached data (including the old /me) and refetch /me fresh —
        // its roleId/tenant now reflect the new JWT, which useSyncActiveWorkspace
        // relies on to confirm the switch instead of reverting it.
        queryClient.clear();
        await queryClient.fetchQuery({ queryKey: ["me"], queryFn: getMe });
        setCurrentWorkspace(tenant.id);

        await new Promise((r) => setTimeout(r, 80));
      } catch (err) {
        toast.error(extractErrorMessage(err, "Could not switch to new workspace."));
      } finally {
        setWorkspaceSwitching(false);
      }
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error));
      // Out of workspace slots — take the user straight to the upgrade options.
      if (extractApiErrorCode(error) === "billing/plan_limit_reached") {
        router.push("/settings/billing");
      }
    },
  });
}

/** Update the active workspace's business category */
export function useUpdateBusinessVertical() {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useAppStore();

  return useMutation({
    mutationFn: (businessVertical: BusinessVertical) =>
      updateTenant(currentWorkspaceId, { businessVertical }),
    onSuccess: () => {
      toast.success('Business category updated');
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Switch to an existing workspace */
export function useSwitchWorkspace() {
  const queryClient = useQueryClient();
  const { setCurrentWorkspace, setWorkspaceSwitching } = useAppStore();

  return useMutation({
    mutationFn: async ({
      tenantId,
      tenantName,
    }: {
      tenantId: string;
      tenantName: string;
    }) => {
      setWorkspaceSwitching(true, tenantName);
      await switchWorkspace(tenantId);
      return tenantId;
    },
    onSuccess: async (tenantId) => {
      // 1. Wipe all stale cache while overlay is covering the UI
      queryClient.clear();
      // 2. Fetch fresh identity for the new workspace
      await queryClient.fetchQuery({ queryKey: ["me"], queryFn: getMe });
      // 3. Update workspace ID — triggers key-based remount of <main>, unmounting all page components
      setCurrentWorkspace(tenantId);
      // 4. Let React process the unmount before lifting the overlay
      await new Promise((r) => setTimeout(r, 80));
      setWorkspaceSwitching(false);
    },
    onError: (error) => {
      setWorkspaceSwitching(false);
      toast.error(extractErrorMessage(error));
    },
  });
}

/** Delete a workspace (owner only) */
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useAppStore();

  return useMutation({
    mutationFn: ({ id, removeMembers }: { id: string; removeMembers?: boolean }) =>
      deleteTenant(id, removeMembers),
    onSuccess: (_, { id: deletedId }) => {
      toast.success("Workspace scheduled for deletion. Restore within 60 days.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      // If deleted the current ws, the server should reset to primary — just invalidate
      if (deletedId === currentWorkspaceId) {
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Leave a workspace you're a non-owner member of */
export function useLeaveWorkspace() {
  const queryClient = useQueryClient();
  const { currentWorkspaceId } = useAppStore();

  return useMutation({
    mutationFn: (tenantId: string) => leaveWorkspace(tenantId),
    onSuccess: (_, tenantId) => {
      toast.success("You left the workspace.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
      if (tenantId === currentWorkspaceId) {
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}

/** Members who left the current workspace (owner/admin view) */
export function useLeftMembers() {
  return useQuery({
    queryKey: ["left-members"],
    queryFn: getLeftMembers,
    staleTime: 60 * 1000,
  });
}

/** Cancel a pending workspace deletion (owner only) */
export function useRestoreTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreTenant(id),
    onSuccess: () => {
      toast.success("Workspace restored.");
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
