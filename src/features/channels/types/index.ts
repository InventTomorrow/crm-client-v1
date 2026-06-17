import { z } from "zod";
export type WAChannelStatus = "CONNECTED" | "DISCONNECTED" | "ERROR";

export interface WAState {
  status: WAChannelStatus;
  phoneNumber: string | null;
  wabaId: string | null;
  phoneNumberId: string | null;
  connectedAt: string | null;
  errorMessage: string | null;
}

export interface WAConfig {
  aiEnabled: boolean;
  autoReply: boolean;
  allowOrderCancellation: boolean;
}

export interface OAuthExchangePayload {
  code: string;
  wabaId: string;
  phoneNumberId: string;
}

export interface WASignupConfig {
  appId: string;
  configId: string;
  graphVersion: string;
}

// Dev / single-tenant connect form — credentials from WhatsApp "API Setup".
export const manualConnectSchema = z.object({
  wabaId: z.string().min(1, "WABA ID is required"),
  phoneNumberId: z.string().min(1, "Phone number ID is required"),
  accessToken: z.string().min(20, "Paste the access token from API Setup"),
});
export type ManualConnectData = z.infer<typeof manualConnectSchema>;
