import { apiClient } from '@/lib/apiClient';
import type {
  FollowUpAnalyticsRange,
  FollowUpAnalyticsView,
  FollowUpSettingsForm,
  FollowUpSettingsView,
  LeadFollowUpPause,
  LeadFollowUpStatus,
} from '../types';

export async function getFollowUpAnalytics(
  range: FollowUpAnalyticsRange,
): Promise<FollowUpAnalyticsView> {
  const response = await apiClient.get<{ success: true; data: FollowUpAnalyticsView }>(
    '/follow-ups/analytics',
    { params: { range } },
  );
  return response.data.data;
}

export async function getLeadFollowUpStatus(leadId: string): Promise<LeadFollowUpStatus> {
  const response = await apiClient.get<{ success: true; data: LeadFollowUpStatus }>(
    `/follow-ups/leads/${leadId}`,
  );
  return response.data.data;
}

export async function getFollowUpSettings(): Promise<FollowUpSettingsView> {
  const response = await apiClient.get<{ success: true; data: FollowUpSettingsView }>(
    '/follow-ups/settings',
  );
  return response.data.data;
}

export async function updateFollowUpSettings(
  settings: FollowUpSettingsForm,
): Promise<FollowUpSettingsView> {
  const response = await apiClient.put<{ success: true; data: FollowUpSettingsView }>(
    '/follow-ups/settings',
    settings,
  );
  return response.data.data;
}

export async function setLeadFollowUpPause(
  leadId: string,
  isPaused: boolean,
): Promise<LeadFollowUpPause> {
  const response = await apiClient.patch<{ success: true; data: LeadFollowUpPause }>(
    `/follow-ups/leads/${leadId}`,
    { paused: isPaused },
  );
  return response.data.data;
}
