export type MessageSenderType = 'CUSTOMER' | 'AI' | 'AGENT' | 'SYSTEM';
export type EscalationStatus = 'PENDING' | 'ESCALATED' | 'RESOLVED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderType: MessageSenderType;
  content: string | null;
  mediaUrl?: string | null;
  mediaType?: MediaType | null;
  isDraft: boolean;
  createdAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  editedAt?: string | null;
}

export interface ConversationListItem {
  id: string;
  channel: string;
  escalationStatus: EscalationStatus;
  aiEnabled: boolean;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
  lead: {
    id: string;
    name: string | null;
    phone: string | null;
    isPersonal: boolean;
  };
  /** Last non-draft message for preview */
  messages: Array<{
    content: string | null;
    senderType: MessageSenderType;
    createdAt: string;
  }>;
}

export interface ConversationDetail extends Omit<ConversationListItem, 'messages'> {
  messages: ConversationMessage[];
}

export type ConversationFilter = 'all' | 'escalated' | 'unread' | 'favorites' | string;
export type MobilePane = 'list' | 'chat' | 'profile';
