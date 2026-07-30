import { apiClient } from '@/lib/apiClient';
import type { UnifiedWAStatus, WAConfig, WAState } from '../types';

// ── Provider-agnostic ───────────────────────────────────────────────────────

/** Which provider (if any) the workspace is connected through. */
export const getUnifiedWAStatus = async (): Promise<UnifiedWAStatus> => {
  const res = await apiClient.get('/whatsapp/status');
  return res.data.data;
};

export const getWAConfig = async (): Promise<WAConfig> => {
  const res = await apiClient.get('/whatsapp/config');
  return res.data.data;
};

export const updateWAConfig = async (config: Partial<WAConfig>): Promise<void> => {
  await apiClient.patch('/whatsapp/config', config);
};

// ── Baileys (QR pairing) provider ───────────────────────────────────────────

export const getWAStatus = async (): Promise<WAState> => {
  const res = await apiClient.get('/whatsapp/baileys/status');
  return res.data.data;
};

export const connectWA = async (): Promise<void> => {
  await apiClient.post('/whatsapp/baileys/connect');
};

export const disconnectWA = async (): Promise<void> => {
  await apiClient.delete('/whatsapp/baileys/disconnect');
};

export const confirmWATakeover = async (): Promise<void> => {
  await apiClient.post('/whatsapp/baileys/takeover/confirm');
};

export const denyWATakeover = async (): Promise<void> => {
  await apiClient.post('/whatsapp/baileys/takeover/deny');
};
