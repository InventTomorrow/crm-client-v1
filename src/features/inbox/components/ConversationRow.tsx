"use client";
import { cn } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { motion } from "framer-motion";
import { Archive, ArchiveRestore, MoreVertical, Star, Trash2 } from "lucide-react";
import { memo, useState } from "react";
import type { ConversationListItem } from "../types";
import { relativeTime } from "../lib/time";
import { EscalationBadge } from "./EscalationBadge";

interface ConversationRowProps {
  conv: ConversationListItem;
  active: boolean;
  onClick: () => void;
  isFavorite: boolean;
  isArchived: boolean;
  onToggleFavorite: () => void;
  onToggleArchive: () => void;
  onDelete: () => void;
}

function ConversationRowBase({
  conv,
  active,
  onClick,
  isFavorite,
  isArchived,
  onToggleFavorite,
  onToggleArchive,
  onDelete,
}: ConversationRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const lastMsg = conv.messages[0];
  const displayName = conv.lead.name ?? conv.lead.phone ?? "Unknown";
  const unread = conv.unreadCount > 0;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuOpen(true);
      }}
      className={cn(
        "group/row relative flex items-center gap-[11px] cursor-pointer px-[14px] py-[11px]",
        "border-b border-[var(--line-soft)] border-l-2 transition-[background] duration-[120ms]",
        active
          ? "bg-[var(--accent-soft)] border-l-[var(--accent)]"
          : "border-l-transparent hover:bg-surface",
      )}
    >
      <div className="relative flex-shrink-0">
        <CRMAvatar name={displayName} size={38} />
        <span className="absolute -bottom-px -right-px w-3.5 h-3.5 rounded-full border-2 border-[var(--surface)] bg-[#25D366] flex items-center justify-center">
          <span className="text-[7px] text-white font-bold">W</span>
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center gap-1.5 mb-0.5">
          <span className="font-medium text-[13.5px] text-[var(--ink)] truncate flex items-center gap-1">
            {isFavorite && (
              <Star
                size={11}
                className="text-[#CA8A04] flex-shrink-0"
                fill="currentColor"
              />
            )}
            <span className="truncate">{displayName}</span>
          </span>
          {lastMsg && (
            <span className="flex-shrink-0 text-[11px] text-[var(--ink-mute)] group-hover/row:hidden">
              {relativeTime(lastMsg.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[12.5px] truncate flex-1",
              unread
                ? "text-[var(--ink)] font-medium"
                : "text-[var(--ink-soft)]",
            )}
          >
            {lastMsg?.senderType === "AI" && (
              <span className="text-[var(--accent)]">AI: </span>
            )}
            {lastMsg?.senderType === "AGENT" && (
              <span className="text-[var(--ink-mute)]">You: </span>
            )}
            {lastMsg?.content ?? "—"}
          </span>
          {unread ? (
            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--accent)] text-white text-[10.5px] font-semibold inline-flex items-center justify-center">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </span>
          ) : (
            <EscalationBadge status={conv.escalationStatus} />
          )}
        </div>
      </div>

      {/* Hover / right-click management menu */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Chat options"
            className={cn(
              "absolute right-2 top-2 flex-shrink-0 p-1 rounded-full text-[var(--ink-mute)] bg-[var(--surface)] shadow-sm transition-opacity",
              menuOpen ? "opacity-100" : "opacity-0 group-hover/row:opacity-100",
            )}
          >
            <MoreVertical size={14} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem onClick={onToggleFavorite}>
            <Star
              size={13}
              className={cn("mr-2", isFavorite ? "text-[#CA8A04]" : "")}
            />
            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleArchive}>
            {isArchived ? (
              <ArchiveRestore size={13} className="mr-2" />
            ) : (
              <Archive size={13} className="mr-2" />
            )}
            {isArchived ? "Unarchive chat" : "Archive chat"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 size={13} className="mr-2" />
            Delete chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}

export const ConversationRow = memo(ConversationRowBase);
