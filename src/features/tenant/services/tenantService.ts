import { apiClient } from "@/lib/apiClient";
import type { BusinessVertical } from "@/lib/business-verticals";
import type { CreateTenantPayload, Tenant, WorkspaceStats } from "../types";

export async function createTenant(data: CreateTenantPayload): Promise<Tenant> {
  const res = await apiClient.post<{ success: true; data: Tenant }>(
    "/tenants",
    data,
  );
  return res.data.data;
}

export async function updateTenant(
  id: string,
  data: { businessVertical: BusinessVertical },
): Promise<Tenant> {
  const res = await apiClient.put<{ success: true; data: Tenant }>(
    `/tenants/${id}`,
    data,
  );
  return res.data.data;
}

export async function deleteTenant(
  id: string,
  removeMembers = false,
): Promise<void> {
  await apiClient.delete(`/tenants/${id}`, { data: { removeMembers } });
}

export async function restoreTenant(id: string): Promise<void> {
  await apiClient.post(`/tenants/${id}/restore`);
}

export async function getTenants(): Promise<Tenant[]> {
  const res = await apiClient.get<{ success: true; data: Tenant[] }>(
    "/tenants",
  );
  return res.data.data;
}

export async function getMyWorkspaceStats(): Promise<WorkspaceStats[]> {
  const res = await apiClient.get<{ success: true; data: WorkspaceStats[] }>(
    "/tenants/me/workspace-stats",
  );
  return res.data.data;
}

export async function getTenantById(id: string): Promise<Tenant> {
  const res = await apiClient.get<{ success: true; data: Tenant }>(
    `/tenants/${id}`,
  );
  return res.data.data;
}
