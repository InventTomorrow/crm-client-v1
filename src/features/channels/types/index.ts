export type WASessionStatus = 'PENDING' | 'CONNECTED' | 'DISCONNECTED';

export interface WAState {
  status: WASessionStatus;
  phoneNumber?: string;
  qr?: string;
  error?: string;
}

export interface WAConfig {
  aiEnabled: boolean;
  autoReply: boolean;
  allowOrderCancellation: boolean;
}

export type WASSEEvent =
  | { type: 'qr'; qr: string }
  | { type: 'status'; status: WASessionStatus; phoneNumber?: string; error?: string };
