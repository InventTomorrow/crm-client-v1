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

export const updateWAConfig = async (config: Partial<WAConfig>): Promise<void> => {
  await apiClient.patch('/whatsapp/config', config);
};
