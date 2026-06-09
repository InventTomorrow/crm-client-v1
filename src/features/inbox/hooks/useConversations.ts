'use client';
import { extractErrorMessage } from '@/lib/utils';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  approveDraft,
  deleteMessage,
  editMessage,
  escalateConversation,
  getConversation,
  getConversations,
  getInboxUnreadCount,
  getMessages,
  markConversationRead,
  resolveConversation,
  sendHumanMessage,
  sendMediaMessage,
  sendTyping,
  toggleAiMode,
  uploadAttachment,
} from '../services/inboxService';
import type { ConversationDetail, ConversationFilter, ConversationListItem } from '../types';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations({}),
    refetchInterval: 5_000,
  });
}

export function useInboxUnreadCount() {
  return useQuery({
    queryKey: ['conversations', 'unread-count'],
    queryFn: getInboxUnreadCount,
    refetchInterval: 10_000,
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markConversationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useInfiniteConversations() {
  return useInfiniteQuery({
    queryKey: ['conversations', 'infinite'],
    queryFn: getConversations,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.length === 25 ? lastPage[lastPage.length - 1].id : undefined,
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

export function useMessagesPaginated(id: string | null) {
  return useInfiniteQuery({
    queryKey: ['conversation', id, 'messages'],
    queryFn: getMessages,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.length === 30 ? lastPage[lastPage.length - 1].id : undefined,
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
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }); queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
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
              isDeleted: false,
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
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }); queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
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
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }); queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
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

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, everyone }: { messageId: string; everyone: boolean }) =>
      deleteMessage(conversationId, messageId, everyone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }); queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
      toast.success('Message deleted');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to delete message')),
  });
}

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      editMessage(conversationId, messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] }); queryClient.invalidateQueries({ queryKey: ['conversation', conversationId, 'messages'] });
      toast.success('Message updated');
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to update message')),
  });
}

// Safety auto-clear: the server emits a "stopped" event on flush, but if it is
// missed we still drop the indicator after this long without a fresh keystroke.
const LEAD_TYPING_TTL_MS = 8_000;

/**
 * Subscribes to the WhatsApp SSE stream and returns the conversation id whose
 * lead is currently typing (or null). One stream powers both the thread
 * indicator and the conversation-list row.
 */
export function useLeadTyping(): string | null {
  const [typingConversationId, setTypingConversationId] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/v1/whatsapp/qr-stream', { withCredentials: true });

    es.onmessage = (e: MessageEvent) => {
      const event = JSON.parse(e.data as string) as { type: string; conversationId?: string; isTyping?: boolean };
      if (event.type !== 'typing' || !event.conversationId) return;

      if (event.isTyping) {
        setTypingConversationId(event.conversationId);
        if (clearTimer.current) clearTimeout(clearTimer.current);
        clearTimer.current = setTimeout(() => setTypingConversationId(null), LEAD_TYPING_TTL_MS);
      } else {
        setTypingConversationId((prev) => (prev === event.conversationId ? null : prev));
      }
    };

    es.onerror = () => es.close();

    return () => {
      es.close();
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  return typingConversationId;
}

const AGENT_TYPING_IDLE_MS = 2_500;

/**
 * Mirrors the agent's composing state onto WhatsApp. Call `onType()` on each
 * keystroke and `stop()` when sending or leaving — sends start once, then a
 * single stop after the agent pauses, so we never spam the endpoint.
 */
export function useAgentTyping(conversationId: string | null) {
  const isTypingRef = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isTypingRef.current && conversationId) {
      isTypingRef.current = false;
      void sendTyping(conversationId, false).catch(() => {});
    }
  }, [conversationId]);

  const onType = useCallback(() => {
    if (!conversationId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      void sendTyping(conversationId, true).catch(() => {});
    }
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(stop, AGENT_TYPING_IDLE_MS);
  }, [conversationId, stop]);

  useEffect(() => stop, [stop]);

  return { onType, stop };
}
