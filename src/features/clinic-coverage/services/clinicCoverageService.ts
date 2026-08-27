import { apiClient } from '@/lib/apiClient';
import type {
  ClinicalServiceCoverage,
  ClinicLocation,
  ClinicLocationFormValues,
  CoverageRowValues,
} from '../types';

export async function getClinicLocations(params?: {
  city?: string;
  isActive?: boolean;
}) {
  const res = await apiClient.get<{ success: true; data: ClinicLocation[] }>(
    '/clinic-coverage/locations',
    { params },
  );
  return res.data.data;
}

export async function createClinicLocation(payload: ClinicLocationFormValues) {
  const res = await apiClient.post<{ success: true; data: ClinicLocation }>(
    '/clinic-coverage/locations',
    payload,
  );
  return res.data.data;
}

export async function updateClinicLocation(
  locationId: string,
  payload: Partial<ClinicLocationFormValues>,
) {
  const res = await apiClient.put<{ success: true; data: ClinicLocation }>(
    `/clinic-coverage/locations/${locationId}`,
    payload,
  );
  return res.data.data;
}

export async function deleteClinicLocation(locationId: string) {
  await apiClient.delete(`/clinic-coverage/locations/${locationId}`);
}

export async function getCoverageRows(params?: {
  clinicalServiceId?: string;
  city?: string;
  isActive?: boolean;
}) {
  const res = await apiClient.get<{
    success: true;
    data: ClinicalServiceCoverage[];
  }>('/clinic-coverage', { params });
  return res.data.data;
}

export async function upsertCoverageRow(payload: CoverageRowValues) {
  const res = await apiClient.post<{
    success: true;
    data: ClinicalServiceCoverage;
  }>('/clinic-coverage', payload);
  return res.data.data;
}

/** One request for the whole grid — 8 services × 20 areas is 160 cells. */
export async function bulkUpsertCoverage(rows: CoverageRowValues[]) {
  const res = await apiClient.post<{
    success: true;
    data: ClinicalServiceCoverage[];
  }>('/clinic-coverage/bulk', { rows });
  return res.data.data;
}

export async function deleteCoverageRow(coverageId: string) {
  await apiClient.delete(`/clinic-coverage/${coverageId}`);
}
