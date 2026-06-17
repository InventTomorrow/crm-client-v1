export type WAChannelStatus = 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

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
