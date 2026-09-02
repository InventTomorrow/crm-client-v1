import { apiClient } from '@/lib/apiClient';
import type {
  CustomizationRequest,
  CustomizationRequestFilters,
  CustomizationRequestsSummary,
  ReviewableStatus,
} from '../types';

const BASE = '/customization-requests';

export async function getCustomizationRequests(
  params: CustomizationRequestFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{ success: true; data: CustomizationRequest[] }>(
    BASE,
    { params },
  );
  return res.data.data;
}

export async function getCustomizationRequestsSummary() {
  const res = await apiClient.get<{
    success: true;
    data: CustomizationRequestsSummary;
  }>(`${BASE}/summary`);
  return res.data.data;
}

export async function getCustomizationRequest(id: string) {
  const res = await apiClient.get<{ success: true; data: CustomizationRequest }>(
    `${BASE}/${id}`,
  );
  return res.data.data;
}

export async function updateCustomizationRequestStatus(
  id: string,
  status: ReviewableStatus,
  internalNote?: string,
) {
  const res = await apiClient.patch<{ success: true; data: CustomizationRequest }>(
    `${BASE}/${id}/status`,
    { status, internalNote },
  );
  return res.data.data;
}

export async function updateCustomizationRequestNote(
  id: string,
  internalNote: string,
) {
  const res = await apiClient.patch<{ success: true; data: CustomizationRequest }>(
    `${BASE}/${id}/note`,
    { internalNote },
  );
  return res.data.data;
}

export async function assignCustomizationRequest(
  id: string,
  assignedToUserId: string | null,
) {
  const res = await apiClient.patch<{ success: true; data: CustomizationRequest }>(
    `${BASE}/${id}/assignee`,
    { assignedToUserId },
  );
  return res.data.data;
}

export async function deleteCustomizationRequest(id: string) {
  const res = await apiClient.delete(`${BASE}/${id}`);
  return res.data;
}
