import { apiClient } from '@/lib/apiClient';
import type {
  ServiceOffering,
  ServiceOfferingFilters,
  ServicePlan,
} from '../types';

export type CreateServiceOfferingPayload = {
  name: string;
  shortDescription: string;
  fullDescription?: string | null;
  category?: string | null;
  deliveryType: string;
  pricingType: string;
  startingPrice?: number | null;
  currency?: string;
  platformsCovered?: string[];
  keyOutcomes?: string[];
  sampleWorkUrl?: string | null;
  isActive?: boolean;
  displayOrder?: number;
  plans?: ServicePlan[];
};

export type UpdateServiceOfferingPayload = Partial<CreateServiceOfferingPayload>;

export async function getServiceOfferings(
  params: ServiceOfferingFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{ success: true; data: ServiceOffering[] }>('/services', {
    params,
  });
  return res.data.data;
}

export async function getServiceOffering(serviceId: string) {
  const res = await apiClient.get<{ success: true; data: ServiceOffering }>(`/services/${serviceId}`);
  return res.data.data;
}

export async function createServiceOffering(payload: CreateServiceOfferingPayload) {
  const res = await apiClient.post<{ success: true; data: ServiceOffering }>('/services', payload);
  return res.data.data;
}

export async function updateServiceOffering(
  serviceId: string,
  payload: UpdateServiceOfferingPayload,
) {
  const res = await apiClient.put<{ success: true; data: ServiceOffering }>(
    `/services/${serviceId}`,
    payload,
  );
  return res.data.data;
}

export async function updateServicePlans(serviceId: string, plans: ServicePlan[]) {
  const res = await apiClient.put<{ success: true; data: ServiceOffering }>(
    `/services/${serviceId}/plans`,
    { plans },
  );
  return res.data.data;
}

export async function deleteServiceOffering(serviceId: string) {
  const res = await apiClient.delete(`/services/${serviceId}`);
  return res.data;
}
