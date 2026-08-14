import { apiClient } from '@/lib/apiClient';
import type { LeadQualification, QualificationForm, QualificationFormData } from '../types';

export async function getQualificationForm() {
  const res = await apiClient.get<{ success: true; data: QualificationForm }>(
    '/qualification/form',
  );
  return res.data.data;
}

export async function upsertQualificationForm(payload: QualificationFormData) {
  const res = await apiClient.put<{ success: true; data: QualificationForm }>(
    '/qualification/form',
    payload,
  );
  return res.data.data;
}

export async function getLeadQualification(leadId: string) {
  const res = await apiClient.get<{ success: true; data: LeadQualification | null }>(
    `/qualification/leads/${leadId}`,
  );
  return res.data.data;
}

/** Records one answer. Scoring, lead-field mapping and pipeline movement all happen server-side. */
export async function recordQualificationAnswer(
  leadId: string,
  payload: { fieldName: string; value: string },
) {
  const res = await apiClient.post<{ success: true; data: LeadQualification }>(
    `/qualification/leads/${leadId}/answers`,
    payload,
  );
  return res.data.data;
}
