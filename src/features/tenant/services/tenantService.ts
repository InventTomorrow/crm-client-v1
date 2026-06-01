import { apiClient } from '@/lib/apiClient';
import type { Tenant, CreateTenantPayload } from '../types';

export async function createTenant(data: CreateTenantPayload): Promise<Tenant> {
  const res = await apiClient.post<{ success: true; data: Tenant }>('/tenants', data);
  return res.data.data;
}

export async function deleteTenant(id: string): Promise<void> {
  await apiClient.delete(`/tenants/${id}`);
}

export async function getTenants(): Promise<Tenant[]> {
  const res = await apiClient.get<{ success: true; data: Tenant[] }>('/tenants');
  return res.data.data;
}

export async function getTenantById(id: string): Promise<Tenant> {
  const res = await apiClient.get<{ success: true; data: Tenant }>(`/tenants/${id}`);
  return res.data.data;
}
