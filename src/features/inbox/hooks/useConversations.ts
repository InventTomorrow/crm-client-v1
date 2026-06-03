'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  approveDraft,
  escalateConversation,
  getConversation,
  getConversations,
  resolveConversation,
  sendHumanMessage,
  sendMediaMessage,
  toggleAiMode,
  uploadAttachment,
} from '../services/inboxService';
import type { ConversationDetail, ConversationFilter, ConversationListItem } from '../types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5_000,
  });
}

export function useConversationDetail(id: string | null) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => getConversation(id!),
    enabled: !!id,
    refetchInterval: 3_000,
  });
}

export function useApproveDraft(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => approveDraft(conversationId, messageId),
    onSuccess: () => {
      toast.success('Reply sent');
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to send reply')),
  });
}

export function useSendHumanReply(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendHumanMessage(conversationId, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['conversation', conversationId] });
      const prev = queryClient.getQueryData<ConversationDetail>(['conversation', conversationId]);
      if (prev) {
        queryClient.setQueryData<ConversationDetail>(['conversation', conversationId], {
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: `optimistic-${Date.now()}`,
              conversationId,
              senderType: 'AGENT',
              content,
              isDraft: false,
              createdAt: new Date().toISOString(),
            },
          ],
        });
      }
      return { prev };
    },
    onError: (error, _content, ctx) => {
      toast.error(extractErrorMessage(error, 'Failed to send message'));
      if (ctx?.prev) queryClient.setQueryData(['conversation', conversationId], ctx.prev);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }),
  });
}

export function useSendMedia(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaUrl, mimeType, caption }: { mediaUrl: string; mimeType: string; caption?: string }) =>
      sendMediaMessage(conversationId, mediaUrl, mimeType, caption),
    onSuccess: () => {
      toast.success('Media sent');
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to send media')),
  });
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file),
    onError: (error) => toast.error(extractErrorMessage(error, 'Upload failed')),
  });
}

export function useToggleAiMode(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleAiMode(conversationId),
    // Optimistically flip aiEnabled in the cached conversation detail + list.
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['conversation', conversationId] });
      const prevDetail = queryClient.getQueryData<ConversationDetail>(['conversation', conversationId]);
      const prevList = queryClient.getQueryData<ConversationListItem[]>(['conversations']);
      if (prevDetail) {
        queryClient.setQueryData<ConversationDetail>(['conversation', conversationId], { ...prevDetail, aiEnabled: !prevDetail.aiEnabled });
      }
      if (prevList) {
        queryClient.setQueryData<ConversationListItem[]>(['conversations'], prevList.map((c) => c.id === conversationId ? { ...c, aiEnabled: !c.aiEnabled } : c));
      }
      return { prevDetail, prevList };
    },
    onError: (error, _v, ctx) => {
      if (ctx?.prevDetail) queryClient.setQueryData(['conversation', conversationId], ctx.prevDetail);
      if (ctx?.prevList) queryClient.setQueryData(['conversations'], ctx.prevList);
      toast.error(extractErrorMessage(error, 'Failed to toggle AI mode'));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useEscalate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: escalateConversation,
    onSuccess: (_, id) => {
      toast.success('Conversation escalated');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to escalate')),
  });
}

export function useResolve() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveConversation,
    onSuccess: (_, id) => {
      toast.success('Conversation resolved');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to resolve')),
  });
}

export function filterConversations(
  conversations: ConversationListItem[],
  filter: ConversationFilter,
): ConversationListItem[] {
  if (filter === 'escalated') return conversations.filter((c) => c.escalationStatus === 'ESCALATED');
  return conversations;
}
