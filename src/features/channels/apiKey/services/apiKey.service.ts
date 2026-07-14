import { apiClient } from '@/lib/apiClient';
import axios from 'axios';
import type {
  ApiKey,
  CreateApiKeyDto,
  CreatedApiKey,
  ExternalOrderTestResult,
} from '../types';

// A bare axios instance, deliberately separate from `apiClient`: the sandbox
// tester authenticates with the *external* API key (Bearer header), not the
// CRM user's session cookies. `apiClient` carries `withCredentials` plus a
// response interceptor that redirects to /auth/login on any unhandled 401 —
// which would fire (logging the CRM user out) when a sandbox key is simply
// wrong/revoked, a routine, expected outcome here rather than a session issue.
const externalApiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? ''}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

export const listApiKeys = async (): Promise<ApiKey[]> => {
  const res = await apiClient.get('/api-keys');
  return res.data.data;
};

export const createApiKey = async (dto: CreateApiKeyDto): Promise<CreatedApiKey> => {
  const res = await apiClient.post('/api-keys', dto);
  return res.data.data;
};

export const revokeApiKey = async (id: string): Promise<ApiKey> => {
  const res = await apiClient.delete(`/api-keys/${id}`);
  return res.data.data;
};

/** Permanently deletes a key. Server requires it to already be revoked. */
export const deleteApiKey = async (id: string): Promise<void> => {
  await apiClient.delete(`/api-keys/${id}/permanent`);
};

/** Sends a real request to the external-orders API using the given key — used by the in-app sandbox tester. */
export const sendTestExternalOrder = async (
  key: string,
  payload: unknown,
): Promise<ExternalOrderTestResult> => {
  const res = await externalApiClient.post('/external/orders', payload, {
    headers: { Authorization: `Bearer ${key}` },
  });
  return res.data.data;
};
