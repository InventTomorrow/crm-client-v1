"use client";
import { cn, getImageUrl } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Edit2,
  FileText,
  Loader2,
  MoreVertical,
  Send,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { memo, useState } from "react";
import type { ConversationMessage } from "../types";
import { shortTime } from "../lib/time";
import { AudioBubble } from "./AudioBubble";
import { Button } from "@/shared/ui/Button";

export interface DeleteMessageTarget {
  messageId: string;
  canDeleteEveryone: boolean;
}

interface MessageBubbleProps {
  msg: ConversationMessage;
  waConnected: boolean;
  approving: boolean;
  /** Customer display name — drives the avatar shown beside inbound messages. */
  peerName: string;
  onEdit: (msg: ConversationMessage) => void;
  onDelete: (target: DeleteMessageTarget) => void;
  onApproveDraft: (id: string) => void;
}

function MessageBubbleBase({
  msg,
  waConnected,
  approving,
  peerName,
  onEdit,
  onDelete,
  onApproveDraft,
}: MessageBubbleProps) {
  const isOutbound = msg.senderType !== "CUSTOMER";
  const isAI = msg.senderType === "AI";
  const isAgent = msg.senderType === "AGENT";
  const isDeleted = msg.isDeleted;
  const age = Date.now() - new Date(msg.createdAt).getTime();
  const isWithin15Mins = age < 15 * 60 * 1000;
  const isWithin60Mins = age < 60 * 60 * 1000;
  const [showTranscript, setShowTranscript] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`flex group relative ${isOutbound ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`flex flex-col max-w-[82%] ${isOutbound ? "items-end" : "items-start"}`}
      >
        {/* Sender label */}
        <div className="flex items-center gap-1 px-1 mb-1">
          {isAI && (
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--accent)] font-medium">
              <Zap size={10} /> AsaanRabta AI
            </span>
          )}
          {isAgent && (
            <span className="flex items-center gap-1 text-[10.5px] text-[var(--ink-mute)]">
              <User size={10} /> You
            </span>
          )}
        </div>

        {/* Avatar + bubble — avatar bottom-aligns flush with the bubble */}
        <div
          className={cn(
            "flex items-end gap-1",
            isOutbound ? "flex-row-reverse" : "flex-row",
          )}
        >
          {/* Sender avatar */}
          <CRMAvatar
            name={isOutbound ? (isAI ? "AsaanRabta AI" : "You") : peerName}
            size={28}
          />

          {/* Bubble + Options wrapper */}
          <div className="flex items-center gap-2">
          {/* Options trigger (shown on hover, unless message is deleted or draft) */}
          {!isDeleted && !msg.isDraft && (
            <div
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center flex-shrink-0",
                isOutbound ? "order-first" : "order-last",
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-[var(--ink-mute)]">
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOutbound ? "end" : "start"}>
                  {isOutbound && isWithin15Mins && (
                    <DropdownMenuItem onClick={() => onEdit(msg)}>
                      <Edit2 size={13} className="mr-1.5" />
                      Edit Message
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() =>
                      onDelete({
                        messageId: msg.id,
                        canDeleteEveryone: isOutbound && isWithin60Mins,
                      })
                    }
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Bubble */}
          {isDeleted ? (
            <div
              className={cn(
                "bubble italic text-[var(--ink-mute)] opacity-70 border border-[var(--line)] bg-transparent",
                !isOutbound && "received",
                isOutbound && "sent",
              )}
              style={{ fontStyle: "italic" }}
            >
              {isOutbound
                ? "You deleted this message"
                : "This message was deleted"}
            </div>
          ) : msg.mediaType === "IMAGE" && msg.mediaUrl ? (
            <div
              className={cn(
                "rounded-[14px] overflow-hidden max-w-[240px]",
                isOutbound
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--surface-2)] border border-[var(--line)]",
                msg.isDraft && "ring-1 ring-dashed ring-[var(--accent)]",
              )}
            >
              <ShimmerImage
                src={getImageUrl(msg.mediaUrl)}
                alt="Product image"
                wrapperClassName="w-full"
                loadingClassName="h-[180px] w-[220px]"
                className="w-full object-cover"
                style={{ maxHeight: 240 }}
              />
              {/* Caption = product details (shown only when content isn't just the URL) */}
              {msg.content && msg.content !== msg.mediaUrl && (
                <div
                  className={cn(
                    "px-2.5 py-1.5 text-[12.5px] leading-snug",
                    isOutbound ? "text-white" : "text-[var(--ink)]",
                  )}
                >
                  {msg.content}
                  {msg.isDraft && (
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                      · Draft
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : msg.mediaType === "AUDIO" && msg.mediaUrl ? (
            <div
              className={cn(
                "rounded-[18px] overflow-hidden",
                isOutbound
                  ? "bg-[var(--accent)]"
                  : "bg-[var(--surface-2)] border border-[var(--line)]",
              )}
            >
              <AudioBubble
                url={getImageUrl(msg.mediaUrl) ?? msg.mediaUrl}
                outbound={isOutbound}
              />
              {msg.content && (
                <div
                  className={cn(
                    "border-t px-2.5 py-1",
                    isOutbound
                      ? "border-white/20"
                      : "border-[var(--line)]",
                  )}
                >
                  <button
                    onClick={() => setShowTranscript((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 text-[10.5px] font-medium",
                      isOutbound ? "text-white/80" : "text-[var(--ink-mute)]",
                    )}
                  >
                    {showTranscript ? (
                      <ChevronUp size={11} />
                    ) : (
                      <ChevronDown size={11} />
                    )}
                    {showTranscript ? "Hide transcript" : "Show transcript"}
                  </button>
                  {showTranscript && (
                    <p
                      className={cn(
                        "mt-1 text-[12.5px] leading-snug",
                        isOutbound ? "text-white" : "text-[var(--ink)]",
                      )}
                    >
                      {msg.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : msg.mediaType === "VIDEO" && msg.mediaUrl ? (
            <div className="rounded-[14px] overflow-hidden max-w-[260px] bg-black">
              <video
                src={getImageUrl(msg.mediaUrl) ?? msg.mediaUrl}
                controls
                className="w-full"
                style={{ maxHeight: 200 }}
              />
              {msg.content && (
                <p className="px-2.5 py-1.5 text-[12.5px] text-white leading-snug">
                  {msg.content}
                </p>
              )}
            </div>
          ) : msg.mediaType === "DOCUMENT" && msg.mediaUrl ? (
            <a
              href={getImageUrl(msg.mediaUrl) ?? msg.mediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "bubble flex items-center gap-2.5",
                !isOutbound && "received",
                isOutbound && "sent",
              )}
            >
              <FileText size={18} className="flex-shrink-0" />
              <span className="text-[13px] underline underline-offset-2 truncate max-w-[160px]">
                {msg.content || "Document"}
              </span>
              <Download size={14} className="flex-shrink-0 opacity-70" />
            </a>
          ) : (
            <div
              className={cn(
                "bubble",
                !isOutbound && "received",
                isOutbound && !msg.isDraft && "sent",
                msg.isDraft &&
                  "border border-dashed border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] rounded-[14px] px-[14px] py-[8px] text-[13.5px]",
              )}
            >
              {msg.content ?? ""}
              {msg.isDraft && (
                <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                  · Draft
                </span>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Draft approve button */}
        {msg.isDraft && (
          <Button
            size="sm"
            onClick={() => onApproveDraft(msg.id)}
            disabled={approving || !waConnected}
            title={!waConnected ? "Connect WhatsApp to send" : undefined}
            className="mt-1.5 self-end"
          >
            {approving ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Send size={11} />
            )}
            Approve & Send
          </Button>
        )}

        <div className="flex items-center gap-1 px-1 mt-[3px] text-[10px] text-[var(--ink-mute)]">
          {shortTime(msg.createdAt)}
          {!isDeleted && msg.editedAt && <span>· Edited</span>}
          {isOutbound && !msg.isDraft && !isDeleted && <Check size={10} />}
        </div>
      </div>
    </motion.div>
  );
}

export const MessageBubble = memo(MessageBubbleBase);
