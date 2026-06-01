'use client';
import { switchWorkspace } from '@/features/auth/services/authService';
import { useAppStore } from '@/lib/appStore';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createTenant, deleteTenant, getTenants } from '../services/tenantService';
import type { CreateTenantPayload } from '../types';

/** Fetch all tenants the current user has access to */
export function useTenants() {
  return useQuery({
    queryKey: ['tenants'],
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
        await queryClient.invalidateQueries({ queryKey: ['me'] });
        await queryClient.refetchQueries({ queryKey: ['me'] });

        // 2. Now switch — the backend membership exists, so it will succeed
        await switchWorkspace(tenant.id);
        setCurrentWorkspace(tenant.id);

        // 3. Invalidate all data for the new workspace
        await queryClient.invalidateQueries({ queryKey: ['tenants'] });
        await queryClient.invalidateQueries({ queryKey: ['leads'] });
        await queryClient.invalidateQueries({ queryKey: ['inventory'] });

        await new Promise(r => setTimeout(r, 600));
      } catch (err: any) {
        toast.error(err?.response?.data?.message ?? 'Could not switch to new workspace.');
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
    mutationFn: async ({ tenantId, tenantName }: { tenantId: string; tenantName: string }) => {
      setWorkspaceSwitching(true, tenantName);
      await switchWorkspace(tenantId);
      return tenantId;
    },
    onSuccess: async (tenantId) => {
      setCurrentWorkspace(tenantId);
      // Invalidate all data queries so they re-fetch for the new workspace
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['inventory'] });
      await queryClient.invalidateQueries({ queryKey: ['analytics'] });
      await queryClient.invalidateQueries({ queryKey: ['tenants'] });
      // Give a moment for queries to settle
      await new Promise(r => setTimeout(r, 600));
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
    mutationFn: (id: string) => deleteTenant(id),
    onSuccess: (_, deletedId) => {
      toast.success('Workspace deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      // If deleted the current ws, the server should reset to primary — just invalidate
      if (deletedId === currentWorkspaceId) {
        queryClient.invalidateQueries();
      }
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });
}
