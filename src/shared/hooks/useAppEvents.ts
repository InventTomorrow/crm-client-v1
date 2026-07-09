"use client";
import { applyWAEventToCache } from "@/features/channels/hooks/useWhatsApp";
import type { WASSEEvent } from "@/features/channels/types";
import { applyConversationEvent } from "@/features/inbox/hooks/useConversations";
import { applyTypingEvent } from "@/features/inbox/stores/typingStore";
import { applyNotificationEvent } from "@/features/notifications/hooks/useNotifications";
import type { NotificationStreamEvent } from "@/features/notifications/types";
import { useAppStore } from "@/lib/appStore";
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
  // Re-open the stream on workspace switch — the auth cookie's tenantId only
  // changes after /auth/switch-workspace, and switching is client-side only
  // (no page reload), so without this the connection stays subscribed to
  // whichever tenant was active when it first opened.
  const currentWorkspaceId = useAppStore((s) => s.currentWorkspaceId);

  useEffect(() => {
    // Connect straight to the API origin instead of the relative path Next's
    // rewrite() proxies — that extra hop doesn't stream chunks as they're
    // written (they arrive batched/delayed), which is fatal for a live QR
    // code that's only valid for a short window. CORS already allows this
    // (server's CLIENT_URL matches, credentials: true).
    const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";
    const es = new EventSource(`${apiOrigin}/api/v1/events`, {
      withCredentials: true,
    });

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
        console.log("event parsing error");
      }
    };
    es.onerror = () => {};

    return () => es.close();
  }, [queryClient, currentWorkspaceId]);
}
