import { apiClient } from '@/lib/apiClient';
import type { ManualConnectData, OAuthExchangePayload, WAConfig, WASignupConfig, WAState } from '../types';

// ── State ──────────────────────────────────────────────────────────────────

/** Returns the current ChannelConnection state for the authenticated tenant. */
export const getWAState = async (): Promise<WAState> => {
  const res = await apiClient.get('/whatsapp/state');
  return res.data.data;
};

// ── OAuth / Embedded Signup ────────────────────────────────────────────────

/**
 * Fetches the public FB JS SDK params needed to launch Embedded Signup
 * (appId, configId, graphVersion). None are secret.
 */
export const getWASignupConfig = async (): Promise<WASignupConfig> => {
  const res = await apiClient.get('/whatsapp/oauth/config');
  return res.data.data;
};

/**
 * Exchanges the Embedded Signup code (returned by FB.login) for a Meta access
 * token. The server persists the encrypted token and returns the fresh WAState.
 */
export const exchangeWAOAuthCode = async (payload: OAuthExchangePayload): Promise<WAState> => {
  const res = await apiClient.post('/whatsapp/oauth/exchange', payload);
  return res.data.data;
};

/**
 * Dev / single-tenant connect using credentials pasted from the WhatsApp
 * "API Setup" page. Bypasses Embedded Signup. The server verifies the token
 * before persisting and returns the fresh WAState.
 */
export const manualConnectWA = async (payload: ManualConnectData): Promise<WAState> => {
  const res = await apiClient.post('/whatsapp/connect-manual', payload);
  return res.data.data;
};

// ── Disconnect ─────────────────────────────────────────────────────────────

export const disconnectWA = async (): Promise<void> => {
  await apiClient.delete('/whatsapp/disconnect');
};

// ── Config ─────────────────────────────────────────────────────────────────

export const getWAConfig = async (): Promise<WAConfig> => {
  const res = await apiClient.get('/whatsapp/config');
  return res.data.data;
};

export const updateWAConfig = async (config: Partial<WAConfig>): Promise<void> => {
  await apiClient.patch('/whatsapp/config', config);
};
