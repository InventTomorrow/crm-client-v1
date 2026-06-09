import { apiClient } from '@/lib/apiClient';
import type { ConversationDetail, ConversationListItem, ConversationMessage } from '../types';

export const getConversations = async ({ pageParam }: { pageParam?: string }): Promise<ConversationListItem[]> => {
  const url = pageParam ? `/conversations?cursor=${pageParam}&limit=25` : '/conversations?limit=25';
  const res = await apiClient.get(url);
  return res.data.data;
};

export const getMessages = async ({ queryKey, pageParam }: { queryKey: any[], pageParam?: string }): Promise<ConversationMessage[]> => {
  const [_key, conversationId] = queryKey;
  const url = pageParam ? `/conversations/${conversationId}/messages?cursor=${pageParam}&limit=30` : `/conversations/${conversationId}/messages?limit=30`;
  const res = await apiClient.get(url);
  return res.data.data;
};

export const getConversation = async (id: string): Promise<ConversationDetail> => {
  const res = await apiClient.get(`/conversations/${id}`);
  return res.data.data;
};

export const getInboxUnreadCount = async (): Promise<number> => {
  const res = await apiClient.get('/conversations/unread-count');
  return res.data.data.count;
};

export const markConversationRead = async (id: string): Promise<void> => {
  await apiClient.patch(`/conversations/${id}/read`);
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
  const res = await apiClient.post(
    `/conversations/${conversationId}/send-media`,
    { mediaUrl, mimeType, caption },
    { headers: { 'Content-Type': 'application/json' } }, // explicit so it survives the 401-refresh retry
  );
  return res.data.data;
};

export const uploadAttachment = async (file: File): Promise<{ url: string }> => {
  const form = new FormData();
  form.append('file', file);
  // Clear the instance's default application/json Content-Type so axios detects
  // the FormData and lets the browser set multipart/form-data WITH a boundary.
  // (Setting it to a literal 'multipart/form-data' omits the boundary → multer
  // can't parse the file → "validation failed".)
  const res = await apiClient.post('/upload?folder=attachments', form, {
    headers: { 'Content-Type': undefined },
  });
  return res.data.data;
};

export const toggleAiMode = async (id: string): Promise<{ aiEnabled: boolean }> => {
  const res = await apiClient.patch(`/conversations/${id}/ai-mode`);
  return res.data.data;
};

export const sendTyping = async (id: string, isTyping: boolean): Promise<void> => {
  await apiClient.post(`/conversations/${id}/typing`, { isTyping });
};

export const escalateConversation = async (id: string): Promise<void> => {
  await apiClient.patch(`/conversations/${id}/escalate`);
};

export const resolveConversation = async (id: string): Promise<void> => {
  await apiClient.patch(`/conversations/${id}/resolve`);
};

export const deleteMessage = async (conversationId: string, messageId: string, everyone: boolean = false): Promise<ConversationMessage> => {
  const res = await apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`, {
    data: { everyone }
  });
  return res.data.data;
};

export const editMessage = async (conversationId: string, messageId: string, content: string): Promise<ConversationMessage> => {
  const res = await apiClient.patch(`/conversations/${conversationId}/messages/${messageId}`, { content });
  return res.data.data;
};
