"use client";
import { getMe, switchWorkspace } from "@/features/auth/services/authService";
import { useAppStore } from "@/lib/appStore";
import { extractErrorMessage } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTenant,
  deleteTenant,
  getTenants,
  restoreTenant,
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

/** Create a new workspace, then immediately switch into it */
export function useCreateTenant() {
  const queryClient = useQueryClient();
  const { setCurrentWorkspace, setWorkspaceSwitching } = useAppStore();

  return useMutation({
    mutationFn: (data: CreateTenantPayload) => createTenant(data),
    onSuccess: async (tenant) => {
      toast.success(`Workspace "${tenant.name}" created!`);
      setWorkspaceSwitching(true, tenant.name);
      try {
        // 1. Refetch /me so the new membership is in the cache before we switch
        await queryClient.invalidateQueries({ queryKey: ["me"] });
        await queryClient.refetchQueries({ queryKey: ["me"] });

        // 2. Now switch — the backend membership exists, so it will succeed
        await switchWorkspace(tenant.id);
        setCurrentWorkspace(tenant.id);

        // 3. Invalidate all data for the new workspace
        await queryClient.invalidateQueries({ queryKey: ["tenants"] });
        await queryClient.invalidateQueries({ queryKey: ["leads"] });
        await queryClient.invalidateQueries({ queryKey: ["inventory"] });
        queryClient.removeQueries({ queryKey: ["conversations"] });
        queryClient.removeQueries({ queryKey: ["conversation"] });
        queryClient.removeQueries({ queryKey: ["orders"] });

        await new Promise((r) => setTimeout(r, 600));
      } catch (err) {
        toast.error(extractErrorMessage(err, "Could not switch to new workspace."));
      } finally {
        setWorkspaceSwitching(false);
      }
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
