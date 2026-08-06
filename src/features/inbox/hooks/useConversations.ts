"use client";
import { extractErrorMessage } from "@/lib/utils";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  approveDraft,
  clearConversation,
  deleteMessage,
  editMessage,
  escalateConversation,
  getConversation,
  getConversations,
  getInboxUnreadCount,
  getMessages,
  markConversationRead,
  openConversationForLead,
  resolveConversation,
  sendHumanMessage,
  sendMediaMessage,
  sendTyping,
  startConversation,
  toggleAiMode,
  uploadAttachment,
  type StartConversationInput,
} from "../services/inboxService";
import { useTypingStore } from "../stores/typingStore";
import type {
  ConversationDetail,
  ConversationFilter,
  ConversationListItem,
} from "../types";

// Polls are slow fallbacks only — the /events SSE stream invalidates these
// caches the moment something changes (see applyConversationEvent).
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations({}),
    refetchInterval: 60_000,
  });
}

/** Newest chats for the header dropdown — the full list, trimmed client-side. */
export function useRecentConversations(limit = 5) {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations({}),
    select: (conversations: ConversationListItem[]) =>
      conversations.slice(0, limit),
    refetchInterval: 60_000,
  });
}

export function useInboxUnreadCount() {
  return useQuery({
    queryKey: ["conversations", "unread-count"],
    queryFn: getInboxUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markConversationRead(id),
    onMutate: (id: string) => {
      // Optimistically zero-out unreadCount so the unread tab updates instantly.
      queryClient.setQueriesData<InfiniteData<ConversationListItem[]>>(
        { queryKey: ["conversations", "infinite"] },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c)),
            ),
          };
        },
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useInfiniteConversations(search?: string) {
  return useInfiniteQuery({
    queryKey: ["conversations", "infinite", search ?? ""],
    queryFn: ({ pageParam }) => getConversations({ pageParam, search }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === 25 ? lastPage[lastPage.length - 1].id : undefined,
    refetchInterval: 60_000,
    // Keep stale data visible during background refetches so the list never
    // flashes empty while a fetch is in-flight (e.g. transient disconnect).
    placeholderData: keepPreviousData,
  });
}

export function useConversationDetail(id: string | null) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: () => getConversation(id!),
    enabled: !!id,
    refetchInterval: 30_000,
  });
}

export function useMessagesPaginated(id: string | null) {
  return useInfiniteQuery({
    queryKey: ["conversation", id, "messages"],
    queryFn: getMessages,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === 30 ? lastPage[lastPage.length - 1].id : undefined,
    enabled: !!id,
    refetchInterval: 30_000,
  });
}

export function useApproveDraft(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId: string) => approveDraft(conversationId, messageId),
    onSuccess: () => {
      toast.success("Reply sent");
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "messages"],
      });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to send reply")),
  });
}

export function useSendHumanReply(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendHumanMessage(conversationId, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({
        queryKey: ["conversation", conversationId],
      });
      const prev = queryClient.getQueryData<ConversationDetail>([
        "conversation",
        conversationId,
      ]);
      if (prev) {
        queryClient.setQueryData<ConversationDetail>(
          ["conversation", conversationId],
          {
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: `optimistic-${Date.now()}`,
                conversationId,
                senderType: "AGENT",
                content,
                isDraft: false,
                createdAt: new Date().toISOString(),
                isDeleted: false,
              },
            ],
          },
        );
      }
      return { prev };
    },
    onError: (error, _content, ctx) => {
      toast.error(extractErrorMessage(error, "Failed to send message"));
      if (ctx?.prev)
        queryClient.setQueryData(["conversation", conversationId], ctx.prev);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      }),
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StartConversationInput) => startConversation(input),
    onSuccess: () => {
      toast.success("Chat started");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "infinite"],
      });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to start chat")),
  });
}

export function useSendMedia(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      mediaUrl,
      mimeType,
      caption,
      fileName,
    }: {
      mediaUrl: string;
      mimeType: string;
      caption?: string;
      fileName?: string;
    }) =>
      sendMediaMessage(conversationId, mediaUrl, mimeType, caption, fileName),
    onSuccess: () => {
      toast.success("Media sent");
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "messages"],
      });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to send media")),
  });
}

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => uploadAttachment(file),
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Upload failed")),
  });
}

export function useToggleAiMode(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => toggleAiMode(conversationId),
    // Optimistically flip aiEnabled in the cached conversation detail + list.
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["conversation", conversationId],
      });
      const prevDetail = queryClient.getQueryData<ConversationDetail>([
        "conversation",
        conversationId,
      ]);
      const prevList = queryClient.getQueryData<ConversationListItem[]>([
        "conversations",
      ]);
      if (prevDetail) {
        queryClient.setQueryData<ConversationDetail>(
          ["conversation", conversationId],
          { ...prevDetail, aiEnabled: !prevDetail.aiEnabled },
        );
      }
      if (prevList) {
        queryClient.setQueryData<ConversationListItem[]>(
          ["conversations"],
          prevList.map((c) =>
            c.id === conversationId ? { ...c, aiEnabled: !c.aiEnabled } : c,
          ),
        );
      }
      return { prevDetail, prevList };
    },
    onError: (error, _v, ctx) => {
      if (ctx?.prevDetail)
        queryClient.setQueryData(
          ["conversation", conversationId],
          ctx.prevDetail,
        );
      if (ctx?.prevList)
        queryClient.setQueryData(["conversations"], ctx.prevList);
      toast.error(extractErrorMessage(error, "Failed to toggle AI mode"));
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

type EscalationStatus = ConversationListItem["escalationStatus"];

/** Optimistically writes the next escalation status into the list + detail caches. */
function patchEscalationCache(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  next: EscalationStatus,
) {
  queryClient.setQueriesData<InfiniteData<ConversationListItem[]>>(
    { queryKey: ["conversations", "infinite"] },
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((c) => (c.id === id ? { ...c, escalationStatus: next } : c)),
        ),
      };
    },
  );
  const detail = queryClient.getQueryData<ConversationDetail>([
    "conversation",
    id,
  ]);
  if (detail) {
    queryClient.setQueryData<ConversationDetail>(["conversation", id], {
      ...detail,
      escalationStatus: next,
    });
  }
}

/** Toggles the flag: clicking an already-escalated chat clears it back to NONE. */
export function useEscalate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: escalateConversation,
    onMutate: (id: string) => {
      const detail = queryClient.getQueryData<ConversationDetail>([
        "conversation",
        id,
      ]);
      const prev = detail?.escalationStatus;
      const next: EscalationStatus =
        prev === "ESCALATED" ? "NONE" : "ESCALATED";
      patchEscalationCache(queryClient, id, next);
      return { prev, next };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(
        ctx?.next === "ESCALATED" ? "Conversation flagged" : "Flag removed",
      );
    },
    onError: (error, id, ctx) => {
      if (ctx?.prev) patchEscalationCache(queryClient, id, ctx.prev);
      toast.error(extractErrorMessage(error, "Failed to update"));
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
  });
}

/** Toggles done: clicking an already-resolved chat clears it back to NONE. */
export function useResolve() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resolveConversation,
    onMutate: (id: string) => {
      const detail = queryClient.getQueryData<ConversationDetail>([
        "conversation",
        id,
      ]);
      const prev = detail?.escalationStatus;
      const next: EscalationStatus = prev === "RESOLVED" ? "NONE" : "RESOLVED";
      patchEscalationCache(queryClient, id, next);
      return { prev, next };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(ctx?.next === "RESOLVED" ? "Marked as done" : "Reopened");
    },
    onError: (error, id, ctx) => {
      if (ctx?.prev) patchEscalationCache(queryClient, id, ctx.prev);
      toast.error(extractErrorMessage(error, "Failed to update"));
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["conversation", id] });
    },
  });
}

/** Deletes a chat's history server-side; the lead is kept for later follow-up. */
export function useDeleteChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clearConversation(id),
    // Optimistically drop the row from the list so the view advances to the next
    // chat immediately — otherwise the auto-select effect re-picks the stale
    // (just-deleted) first row before the refetch lands.
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: ["conversations", "infinite"],
      });
      const prev = queryClient.getQueriesData<
        InfiniteData<ConversationListItem[]>
      >({
        queryKey: ["conversations", "infinite"],
      });
      queryClient.setQueriesData<InfiniteData<ConversationListItem[]>>(
        { queryKey: ["conversations", "infinite"] },
        (old) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page) => page.filter((c) => c.id !== id)),
          };
        },
      );
      return { prev };
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["conversation", id] });
      toast.success("Chat deleted");
    },
    onError: (error, _id, ctx) => {
      ctx?.prev?.forEach(([key, data]) => queryClient.setQueryData(key, data));
      toast.error(extractErrorMessage(error, "Failed to delete chat"));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

/** Opens (or creates) a lead's chat so it can be messaged from the CRM. */
export function useOpenConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leadId: string) => openConversationForLead(leadId),
    onSuccess: (detail) => {
      queryClient.setQueryData(["conversation", detail.id], detail);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to open chat")),
  });
}

export function filterConversations(
  conversations: ConversationListItem[],
  filter: ConversationFilter,
  favorites?: Set<string>,
  tabAssignments?: Record<string, string[]>,
  archived?: Set<string>,
  hidden?: Set<string>,
): ConversationListItem[] {
  // Locally deleted chats never appear anywhere.
  const visible = conversations.filter((c) => !hidden?.has(c.id));
  // The Archived tab shows only archived chats; every other view excludes them.
  if (filter === "archived")
    return visible.filter((c) => archived?.has(c.id) ?? false);
  const active = visible.filter((c) => !archived?.has(c.id));
  if (filter === "escalated")
    return active.filter((c) => c.escalationStatus === "ESCALATED");
  if (filter === "unread") return active.filter((c) => c.unreadCount > 0);
  if (filter === "favorites")
    return active.filter((c) => favorites?.has(c.id) ?? false);
  // Custom tab: only show assigned conversations
  if (tabAssignments && filter in tabAssignments) {
    const ids = tabAssignments[filter];
    return active.filter((c) => ids.includes(c.id));
  }
  return active;
}

export function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      everyone,
    }: {
      messageId: string;
      everyone: boolean;
    }) => deleteMessage(conversationId, messageId, everyone),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "messages"],
      });
      toast.success("Message deleted");
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to delete message")),
  });
}

export function useEditMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => editMessage(conversationId, messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversationId, "messages"],
      });
      toast.success("Message updated");
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, "Failed to update message")),
  });
}

/**
 * Conversation id whose lead is currently typing (or null). Fed by the
 * app-wide /events stream via applyTypingEvent — no extra connection.
 */
export function useLeadTyping(): string | null {
  return useTypingStore((s) => s.typingConversationId);
}

const AGENT_TYPING_IDLE_MS = 2_500;

/**
 * Folds a conversation SSE event into the inbox caches by invalidation —
 * list, thread, and unread badge refresh the moment something changes.
 * Called by useAppEvents for every conversation event.
 */
export function applyConversationEvent(
  queryClient: QueryClient,
  event: { type: string; conversationId?: string },
): void {
  if (event.type === "new-message") {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    queryClient.invalidateQueries({ queryKey: ["conversations", "infinite"] });
    queryClient.invalidateQueries({
      queryKey: ["conversation", event.conversationId],
    });
    queryClient.invalidateQueries({
      queryKey: ["conversation", event.conversationId, "messages"],
    });
    queryClient.invalidateQueries({
      queryKey: ["conversations", "unread-count"],
    });
  }
  if (event.type === "new-conversation") {
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    queryClient.invalidateQueries({ queryKey: ["conversations", "infinite"] });
    queryClient.invalidateQueries({
      queryKey: ["conversations", "unread-count"],
    });
  }
}

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
