"use client";
import {
  applyWAEventToCache,
} from "@/features/channels/hooks/useWhatsApp";
import type { WASSEEvent } from "@/features/channels/types";
import { applyConversationEvent } from "@/features/inbox/hooks/useConversations";
import { applyTypingEvent } from "@/features/inbox/stores/typingStore";
import { applyNotificationEvent } from "@/features/notifications/hooks/useNotifications";
import type { NotificationStreamEvent } from "@/features/notifications/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type AppEvent =
  | WASSEEvent
  | NotificationStreamEvent
  | { type: "new-message" | "new-conversation"; conversationId?: string }
  | { type: "typing"; conversationId: string; isTyping: boolean };

/**
 * The app's single realtime subscription: one SSE connection to /api/v1/events
 * carrying WhatsApp status/QR, conversation updates, notifications and typing.
 * Each event is folded into the matching query cache / store, so every badge
 * and view updates live without per-feature streams or fast polling.
 * Mount once near the app root (AppTopBar; onboarding mounts its own).
 */
export function useAppEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const es = new EventSource("/api/v1/events", { withCredentials: true });

    es.onmessage = (e: MessageEvent) => {
      try {
        const event = JSON.parse(e.data as string) as AppEvent;
        switch (event.type) {
          case "qr":
          case "status":
          case "phone-conflict":
            applyWAEventToCache(queryClient, event);
            break;
          case "unread-count":
          case "notification":
            applyNotificationEvent(queryClient, event);
            break;
          case "new-message":
          case "new-conversation":
            applyConversationEvent(queryClient, event);
            break;
          case "typing":
            applyTypingEvent(event);
            break;
        }
      } catch {
        /* malformed payload — ignore */
      }
    };

    // A transient drop is NOT teardown: EventSource auto-reconnects and the
    // server replays snapshots (WA status, unread count) on each (re)open.
    // The slow polled queries remain the backup source of truth meanwhile.
    es.onerror = () => {};

    return () => es.close();
  }, [queryClient]);
}
