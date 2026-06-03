"use client";
import { cn, pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import type { Lead, LeadStatus } from "../types";

// ──────────────────── Lead Card (Kanban) ────────────────────
export default function LeadCard({
  lead,
  onClick,
  draggable,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  lead: Lead;
  onClick: () => void;
  draggable?: boolean;
  dragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onStatusChange?: (s: LeadStatus) => void;
}) {
  return (
    <div
      className={cn(
        "card kanban-card flex flex-col gap-2 p-[11px]",
        dragging ? "dragging" : "",
        draggable ? "cursor-grab" : "cursor-pointer",
        lead.status === "hot"
          ? "border-[#FCA5A5] bg-[rgba(254,242,242,0.6)]"
          : "border-[var(--line)] bg-[var(--surface)]",
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        <CRMAvatar name={lead.name} size={30} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[13px] text-[var(--ink)]">
            {lead.name}
          </div>
          <div className="text-[11px] text-[var(--ink-mute)]">
            {lead.city} · {lead.time}
          </div>
        </div>
        {lead.status === "hot" && <span className="dot dot-hot pulse-hot" />}
      </div>
      <div className="text-[12px] truncate text-[var(--ink-soft)]">
        {lead.lastMsg}
      </div>
      <div className="flex items-center justify-between gap-1.5">
        <ChannelBadge channel={lead.channel} size="xs" />
        {lead.value > 0 && (
          <span className="entity-chip entity-money">{pkr(lead.value)}</span>
        )}
      </div>
    </div>
  );
}
