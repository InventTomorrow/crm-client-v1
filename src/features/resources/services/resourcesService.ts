import { apiClient } from '@/lib/apiClient';
import type { ResourceFilters, ResourceFormData, TenantResource } from '../types';

export async function getResources(
  params: ResourceFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{
    success: true;
    data: TenantResource[];
    nextCursor: string | null;
  }>('/resources', { params });
  return { items: res.data.data ?? [], nextCursor: res.data.nextCursor };
}

export async function getResource(resourceId: string) {
  const res = await apiClient.get<{ success: true; data: TenantResource }>(
    `/resources/${resourceId}`,
  );
  return res.data.data;
}

export async function createResource(payload: ResourceFormData) {
  const res = await apiClient.post<{ success: true; data: TenantResource }>(
    '/resources',
    payload,
  );
  return res.data.data;
}

export async function updateResource(resourceId: string, payload: Partial<ResourceFormData>) {
  const res = await apiClient.put<{ success: true; data: TenantResource }>(
    `/resources/${resourceId}`,
    payload,
  );
  return res.data.data;
}

export async function deleteResource(resourceId: string) {
  await apiClient.delete(`/resources/${resourceId}`);
  return resourceId;
}

/** Preview which resources a given set of qualification answers would unlock. */
export async function matchResources(answers: Record<string, string | string[]>) {
  const res = await apiClient.post<{ success: true; data: TenantResource[] }>(
    '/resources/match',
    { answers },
  );
  return res.data.data ?? [];
}
