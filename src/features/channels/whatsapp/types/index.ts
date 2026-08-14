export type WASessionStatus = 'PENDING' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';

export interface WAState {
  status: WASessionStatus;
  phoneNumber?: string;
  qr?: string;
  error?: string;
  conflict?: { phoneNumber: string; conflictWorkspaces: string[] };
}

export interface WAConfig {
  aiEnabled: boolean;
  autoReply: boolean;
  allowOrderCancellation: boolean;
  allowReschedule: boolean;
}

export type WASSEEvent =
  | { type: 'qr'; qr: string }
  | { type: 'status'; status: WASessionStatus; phoneNumber?: string; error?: string }
  | { type: 'phone-conflict'; phoneNumber: string; conflictWorkspaces: string[] };
