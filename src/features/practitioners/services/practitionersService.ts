import { apiClient } from '@/lib/apiClient';
import type {
  Practitioner,
  PractitionerFilters,
  PractitionerFormValues,
  PractitionerTimeOff,
} from '../types';

export type CreatePractitionerPayload = PractitionerFormValues;
export type UpdatePractitionerPayload = Partial<PractitionerFormValues>;

export async function getPractitioners(
  params: PractitionerFilters & { cursor?: string; limit?: number },
) {
  const res = await apiClient.get<{ success: true; data: Practitioner[] }>(
    '/practitioners',
    {
      params,
    },
  );
  return res.data.data;
}

export async function getPractitioner(practitionerId: string) {
  const res = await apiClient.get<{ success: true; data: Practitioner }>(
    `/practitioners/${practitionerId}`,
  );
  return res.data.data;
}

export async function createPractitioner(payload: CreatePractitionerPayload) {
  const res = await apiClient.post<{ success: true; data: Practitioner }>(
    '/practitioners',
    payload,
  );
  return res.data.data;
}

export async function updatePractitioner(
  practitionerId: string,
  payload: UpdatePractitionerPayload,
) {
  const res = await apiClient.put<{ success: true; data: Practitioner }>(
    `/practitioners/${practitionerId}`,
    payload,
  );
  return res.data.data;
}

export async function deletePractitioner(practitionerId: string) {
  await apiClient.delete(`/practitioners/${practitionerId}`);
}

export async function getPractitionerTimeOff(
  practitionerId: string,
  params?: { from?: string; to?: string },
) {
  const res = await apiClient.get<{
    success: true;
    data: PractitionerTimeOff[];
  }>(`/practitioners/${practitionerId}/time-off`, { params });
  return res.data.data;
}

export async function addPractitionerTimeOff(
  practitionerId: string,
  payload: { startsAt: string; endsAt: string; reason?: string },
) {
  const res = await apiClient.post<{
    success: true;
    data: PractitionerTimeOff;
  }>(`/practitioners/${practitionerId}/time-off`, payload);
  return res.data.data;
}

export async function removePractitionerTimeOff(
  practitionerId: string,
  timeOffId: string,
) {
  await apiClient.delete(
    `/practitioners/${practitionerId}/time-off/${timeOffId}`,
  );
}
