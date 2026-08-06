"use client";

import {
  useInboxUnreadCount,
  useRecentConversations,
} from "@/features/inbox/hooks/useConversations";
import type { ConversationListItem } from "@/features/inbox/types";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { HeaderIconButton } from "@/shared/ui/HeaderIconButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { MessageSquare, MessageSquareOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/** WhatsApp-style stamp: clock time for today, short date before that. */
function formatChatTime(iso: string): string {
  const sentAt = new Date(iso);
  const isToday = sentAt.toDateString() === new Date().toDateString();
  return isToday
    ? sentAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : sentAt.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function previewOf(conversation: ConversationListItem): string {
  const lastMessage = conversation.messages[0];
  if (!lastMessage?.content?.trim()) return "Media message";
  return lastMessage.senderType === "CUSTOMER"
    ? lastMessage.content
    : `You: ${lastMessage.content}`;
}

function ChatRow({
  conversation,
  onOpen,
}: {
  conversation: ConversationListItem;
  onOpen: () => void;
}) {
  const displayName =
    conversation.lead.name?.trim() || conversation.lead.phone || "Unknown";

  return (
    <Link
      href={`/inbox?lead=${conversation.lead.id}`}
      onClick={onOpen}
      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)]"
    >
      <CRMAvatar name={displayName} size={38} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-[13px] font-medium text-[var(--ink)]">
            {displayName}
          </span>
          <span className="shrink-0 text-[11px] text-[var(--ink-mute)]">
            {formatChatTime(conversation.lastMessageAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span
            className={cn(
              "line-clamp-1 flex-1 text-[12px]",
              conversation.unreadCount > 0
                ? "font-medium text-[var(--ink-soft)]"
                : "text-[var(--ink-mute)]",
            )}
          >
            {previewOf(conversation)}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[9.5px] font-semibold text-white">
              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Header chats popover — recent conversations with a jump into the inbox. */
export function ChatsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: conversations = [], isLoading } = useRecentConversations(6);
  const { data: unreadTotal = 0 } = useInboxUnreadCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <HeaderIconButton label="Chats" badgeCount={unreadTotal}>
          <MessageSquare size={18} />
        </HeaderIconButton>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[350px] gap-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
          <h3 className="text-[15px] font-semibold text-[var(--ink)]">Chats</h3>
          {unreadTotal > 0 && (
            <span className="badge bg-[var(--accent)] font-medium text-white">
              {unreadTotal > 99 ? "99+" : unreadTotal} unread
            </span>
          )}
        </div>

        <div className="scroll max-h-[380px] divide-y divide-[var(--line-soft)] overflow-y-auto">
          {isLoading && (
            <div className="p-8 text-center text-[13px] text-[var(--ink-mute)]">
              Loading…
            </div>
          )}
          {!isLoading && conversations.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-[var(--ink-mute)]">
              <MessageSquareOff size={20} />
              <p className="text-[13px]">No conversations yet.</p>
            </div>
          )}
          {conversations.map((conversation) => (
            <ChatRow
              key={conversation.id}
              conversation={conversation}
              onOpen={() => setIsOpen(false)}
            />
          ))}
        </div>

        <div className="border-t border-[var(--line)] px-4 py-2.5 text-center">
          <Link
            href="/inbox"
            onClick={() => setIsOpen(false)}
            className="text-[13px] font-semibold text-[var(--accent)] hover:underline"
          >
            View all chats
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
