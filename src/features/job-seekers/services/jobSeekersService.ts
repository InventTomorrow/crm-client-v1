import { apiClient } from "@/lib/apiClient";
import type {
  JobSeeker,
  JobSeekerConfig,
  JobSeekerConfigValues,
  JobSeekerFormValues,
  JobSeekersPage,
} from "../types";

export const JOB_SEEKERS_PAGE_SIZE = 25;

export async function listJobSeekers(params: {
  search: string;
  page: number;
}): Promise<JobSeekersPage> {
  const res = await apiClient.get<{ success: true; data: JobSeekersPage }>(
    "/job-seekers",
    {
      params: {
        page: params.page,
        limit: JOB_SEEKERS_PAGE_SIZE,
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return res.data.data;
}

export async function getJobSeeker(leadId: string): Promise<JobSeeker> {
  const res = await apiClient.get<{ success: true; data: JobSeeker }>(
    `/job-seekers/${leadId}`,
  );
  return res.data.data;
}

export async function getJobSeekerConfig(): Promise<JobSeekerConfig> {
  const res = await apiClient.get<{ success: true; data: JobSeekerConfig }>(
    "/job-seekers/config",
  );
  return res.data.data;
}

export async function updateJobSeekerConfig(
  config: JobSeekerConfigValues,
): Promise<JobSeekerConfig> {
  const res = await apiClient.put<{ success: true; data: JobSeekerConfig }>(
    "/job-seekers/config",
    config,
  );
  return res.data.data;
}

export async function createJobSeeker(
  values: JobSeekerFormValues,
): Promise<void> {
  await apiClient.post("/job-seekers", values);
}

export async function updateJobSeeker(params: {
  leadId: string;
  values: JobSeekerFormValues;
}): Promise<void> {
  await apiClient.put(`/job-seekers/${params.leadId}`, params.values);
}

export async function deleteJobSeeker(leadId: string): Promise<void> {
  await apiClient.delete(`/job-seekers/${leadId}`);
}
