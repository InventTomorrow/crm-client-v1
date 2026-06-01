import { apiClient } from '@/lib/apiClient';
import type { ConversationDetail, ConversationListItem, ConversationMessage } from '../types';

export const getConversations = async (): Promise<ConversationListItem[]> => {
  const res = await apiClient.get('/conversations');
  return res.data.data;
};

export const getConversation = async (id: string): Promise<ConversationDetail> => {
  const res = await apiClient.get(`/conversations/${id}`);
  return res.data.data;
};

export const approveDraft = async (conversationId: string, messageId: string): Promise<ConversationMessage> => {
  const res = await apiClient.post(`/conversations/${conversationId}/drafts/approve`, { messageId });
  return res.data.data;
};

export const sendHumanMessage = async (conversationId: string, content: string): Promise<ConversationMessage> => {
  const res = await apiClient.post(`/conversations/${conversationId}/send`, { content });
  return res.data.data;
};

export const sendMediaMessage = async (
  conversationId: string,
  mediaUrl: string,
  mimeType: string,
  caption?: string,
): Promise<ConversationMessage> => {
  const res = await apiClient.post(`/conversations/${conversationId}/send-media`, { mediaUrl, mimeType, caption });
  return res.data.data;
};

export const uploadAttachment = async (file: File): Promise<{ url: string }> => {
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post('/upload?folder=attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const escalateConversation = async (id: string): Promise<void> => {
  await apiClient.patch(`/conversations/${id}/escalate`);
};

export const resolveConversation = async (id: string): Promise<void> => {
  await apiClient.patch(`/conversations/${id}/resolve`);
};
