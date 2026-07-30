import { z } from 'zod';

export type WASessionStatus = 'PENDING' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

/** How the workspace's WhatsApp is connected — QR pairing (Baileys) or Meta Cloud API. */
export type WAProvider = 'BAILEYS' | 'META';

export interface WAState {
  status: WASessionStatus;
  phoneNumber?: string;
  qr?: string;
  error?: string;
  conflict?: { phoneNumber: string; conflictWorkspaces: string[] };
}

/** Provider-agnostic snapshot from GET /whatsapp/status. */
export interface UnifiedWAStatus {
  provider: WAProvider | null;
  status: WASessionStatus | 'ERROR';
  phoneNumber: string | null;
  error: string | null;
}

export interface WAConfig {
  aiEnabled: boolean;
  autoReply: boolean;
  allowOrderCancellation: boolean;
}

export type WASSEEvent =
  | { type: 'qr'; qr: string }
  | { type: 'status'; status: WASessionStatus; phoneNumber?: string; error?: string }
  | { type: 'phone-conflict'; phoneNumber: string; conflictWorkspaces: string[] };

// ── Meta Cloud API provider ─────────────────────────────────────────────────

export interface MetaWAState {
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  phoneNumber: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
  connectedAt: string | null;
  errorMessage: string | null;
}

/** Public FB JS SDK params for Embedded Signup (GET /whatsapp/meta/oauth/config). */
export interface MetaSignupConfig {
  configured: boolean;
  appId: string | null;
  configId: string | null;
  graphVersion: string;
}

export interface MetaOAuthExchangePayload {
  code: string;
  wabaId: string;
  phoneNumberId: string;
}

// Dev / single-tenant connect with credentials from the Meta "API Setup" page.
export const metaManualConnectSchema = z.object({
  wabaId: z.string().min(1, 'WABA ID is required'),
  phoneNumberId: z.string().min(1, 'Phone Number ID is required'),
  accessToken: z.string().min(20, 'Access token looks too short'),
});
export type MetaManualConnectPayload = z.infer<typeof metaManualConnectSchema>;
