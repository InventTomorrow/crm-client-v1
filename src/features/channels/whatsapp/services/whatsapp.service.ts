import { apiClient } from '@/lib/apiClient';
import type { WAConfig, WAState } from '../types';

export const getWAStatus = async (): Promise<WAState> => {
  const res = await apiClient.get('/whatsapp/status');
  return res.data.data;
};

export const getWAConfig = async (): Promise<WAConfig> => {
  const res = await apiClient.get('/whatsapp/config');
  return res.data.data;
};

export const connectWA = async (): Promise<void> => {
  await apiClient.post('/whatsapp/connect');
};

export const disconnectWA = async (): Promise<void> => {
  await apiClient.delete('/whatsapp/disconnect');
};

export const confirmWATakeover = async (): Promise<void> => {
  await apiClient.post('/whatsapp/takeover/confirm');
};

export const denyWATakeover = async (): Promise<void> => {
  await apiClient.post('/whatsapp/takeover/deny');
};

export const updateWAConfig = async (config: Partial<WAConfig>): Promise<void> => {
  await apiClient.patch('/whatsapp/config', config);
};

export interface CheckNumberResult {
  exists: boolean;
  phone: string | null;
  isConnected: boolean;
  jid?: string;
  reason:
    | 'NO_PHONE'
    | 'INVALID_PHONE'
    | 'CHANNEL_DISCONNECTED'
    | 'NOT_ON_WHATSAPP'
    | 'VERIFICATION_FAILED'
    | null;
}

export const checkWhatsAppNumber = async (input: { phone?: string; leadId?: string }): Promise<CheckNumberResult> => {
  const res = await apiClient.post('/whatsapp/check-number', input);
  return res.data.data;
};
