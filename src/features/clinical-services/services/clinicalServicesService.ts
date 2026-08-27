import { apiClient } from "@/lib/apiClient";
import type {
  ClinicalService,
  ClinicalServiceFilters,
  ClinicalServiceFormValues,
} from "../types";

export type CreateClinicalServicePayload = ClinicalServiceFormValues;
export type UpdateClinicalServicePayload = Partial<ClinicalServiceFormValues>;

export async function getClinicalServices(
  params: ClinicalServiceFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{ success: true; data: ClinicalService[] }>(
    "/clinical-services",
    { params },
  );
  return res.data.data;
}

export async function getClinicalService(serviceId: string) {
  const res = await apiClient.get<{ success: true; data: ClinicalService }>(
    `/clinical-services/${serviceId}`,
  );
  return res.data.data;
}

export async function createClinicalService(
  payload: CreateClinicalServicePayload,
) {
  const res = await apiClient.post<{ success: true; data: ClinicalService }>(
    "/clinical-services",
    payload,
  );
  return res.data.data;
}

export async function updateClinicalService(
  serviceId: string,
  payload: UpdateClinicalServicePayload,
) {
  const res = await apiClient.put<{ success: true; data: ClinicalService }>(
    `/clinical-services/${serviceId}`,
    payload,
  );
  return res.data.data;
}

export async function deleteClinicalService(serviceId: string) {
  await apiClient.delete(`/clinical-services/${serviceId}`);
}
