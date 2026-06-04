export type BroadcastStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface Broadcast {
  id:        string;
  status:    BroadcastStatus;
  total:     number;
  sent:      number;
  failed:    number;
  body?:     string | null;
  mediaUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBroadcastPayload {
  message?:     string;
  mediaUrl?:    string;
  mimeType?:    string;
  leadIds:      string[] | 'all';
  statusFilter?: string;
}

export interface CreateBroadcastResult {
  broadcastId: string;
  total:       number;
}
