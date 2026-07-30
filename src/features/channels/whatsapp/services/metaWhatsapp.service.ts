import { apiClient } from '@/lib/apiClient';
import type {
  MetaManualConnectPayload,
  MetaOAuthExchangePayload,
  MetaSignupConfig,
  MetaWAState,
} from '../types';

export const getMetaSignupConfig = async (): Promise<MetaSignupConfig> => {
  const res = await apiClient.get('/whatsapp/meta/oauth/config');
  return res.data.data;
};

export const exchangeMetaOAuthCode = async (
  payload: MetaOAuthExchangePayload,
): Promise<MetaWAState> => {
  const res = await apiClient.post('/whatsapp/meta/oauth/exchange', payload);
  return res.data.data;
};

export const connectMetaManual = async (
  payload: MetaManualConnectPayload,
): Promise<MetaWAState> => {
  const res = await apiClient.post('/whatsapp/meta/connect-manual', payload);
  return res.data.data;
};

export const getMetaWAState = async (): Promise<MetaWAState> => {
  const res = await apiClient.get('/whatsapp/meta/state');
  return res.data.data;
};

export const disconnectMetaWA = async (): Promise<void> => {
  await apiClient.delete('/whatsapp/meta/disconnect');
};
