"use client";
import { applyWAEventToCache } from "@/features/channels/whatsapp/hooks/useWhatsApp";
import type { WASSEEvent } from "@/features/channels/whatsapp/types";
import { applyConversationEvent } from "@/features/inbox/hooks/useConversations";
import { applyTypingEvent } from "@/features/inbox/stores/typingStore";
import { applyNotificationEvent } from "@/features/notifications/hooks/useNotifications";
import type { NotificationStreamEvent } from "@/features/notifications/types";
import { refreshAccessToken } from "@/lib/apiClient";
import { useAppStore } from "@/lib/appStore";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

const RECONNECT_DELAY_MS = 3_000;

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
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const connect = () => {
      // Connect straight to the API origin instead of the relative path Next's
      // rewrite() proxies — that extra hop doesn't stream chunks as they're
      // written (they arrive batched/delayed), which is fatal for a live QR
      // code that's only valid for a short window. CORS already allows this
      // (server's CLIENT_URL matches, credentials: true).
      const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? "";
      es = new EventSource(`${apiOrigin}/api/v1/events`, {
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

      // A native EventSource permanently closes on any non-2xx handshake
      // response (readyState → CLOSED) instead of auto-retrying — that only
      // happens for a connection that drops after being established. So an
      // access-token cookie that expired (15m TTL) while the tab was open,
      // or was already stale at mount, kills the stream for good with no
      // browser-level recovery. apiClient's axios interceptor handles this
      // for REST calls by refreshing and retrying, but EventSource has no
      // interceptor hook, so we replicate that here — using the same
      // single-flight refreshAccessToken() the interceptor uses, so this
      // doesn't race a concurrent REST 401 (e.g. clicking "Connect WhatsApp"
      // right as the cookie expires) for the same rotate-and-revoke refresh
      // token. If the refresh itself fails, refreshAccessToken() redirects
      // to /auth/login — don't loop reconnecting.
      es.onerror = () => {
        es?.close();
        if (cancelled) return;
        reconnectTimer = setTimeout(() => {
          refreshAccessToken()
            .then(() => {
              if (!cancelled) connect();
            })
            .catch(() => {
              // A genuinely invalid session redirects to /auth/login inside
              // refreshAccessToken(), which unmounts this before the next
              // attempt fires. Anything else (server restart, network blip)
              // is transient — retry instead of leaving the stream dead and
              // the status badge stuck on stale data forever.
              if (!cancelled) connect();
            });
        }, RECONNECT_DELAY_MS);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [queryClient, currentWorkspaceId]);
}
