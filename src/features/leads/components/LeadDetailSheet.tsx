"use client";
import { pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import {
  Inbox,
  Link,
  Loader2,
  MapPin,
  Pencil,
  Zap,
  Trash2,
  X,
} from "lucide-react";
import { Lead, STATUS_META } from "../types";

export default function LeadDetailSheet({
  lead,
  onClose,
  onEdit,
  onDelete,
  onOpenChat,
  isDeleting,
}: {
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onOpenChat: (lead: Lead) => void;
  isDeleting?: boolean;
}) {
  if (!lead) return null;
  const statusMeta = STATUS_META[lead.status];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[420px] z-[70]">
        <div className="relative p-[18px] border-b border-[var(--line)]">
          <button
            className="btn btn-ghost absolute top-2.5 right-2.5 p-1.5"
            onClick={onClose}
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <CRMAvatar name={lead.name} size={52} ring />
            <div>
              <h3 className="text-[17px] font-semibold">{lead.name}</h3>
              <div className="flex gap-1.5 items-center mt-1">
                <span
                  className="badge font-medium flex items-center gap-1.5 py-[3px] px-[9px]"
                  style={{
                    background: statusMeta.tint,
                    color: statusMeta.color,
                    border: `1px solid ${statusMeta.tint}`,
                  }}
                >
                  <span
                    className="dot w-[7px] h-[7px]"
                    style={{ background: statusMeta.color }}
                  />
                  {statusMeta.label}
                </span>
                <ChannelBadge channel={lead.channel} />
              </div>
              <div className="text-[11.5px] mt-1 flex items-center gap-1 text-[var(--ink-mute)]">
                <MapPin size={11} /> {lead.city}, Pakistan
              </div>
            </div>
          </div>
        </div>
        <div className="scroll flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Lifetime Value", v: pkr(lead.value || 0) },
              { l: "Last Active", v: `${lead.time} ago` },
              { l: "Channel", v: lead.channel.toUpperCase() },
            ].map((k, i) => (
              <div key={i} className="card p-[11px]">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                  {k.l}
                </div>
                <div className="font-semibold text-[17px] mt-1 text-[var(--ink)] font-[var(--font-head)]">
                  {k.v}
                </div>
              </div>
            ))}
          </div>
          <div className="card p-3 bg-[var(--surface-2)]">
            <div className="text-[11px] uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1.5 text-[var(--ink-mute)]">
              <Zap size={11} className="text-[var(--accent)]" />{" "}
              AI-Suggested Next Action
            </div>
            <div className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              Send a personalized checkout link with a 5% bundle discount on
              Lawn Suit 3-pc. High intent + repeat buyer; est. conversion:{" "}
              <b className="text-[#15803D]">78%</b>.
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3.5 border-t border-[var(--line)]">
          <div className="flex gap-2">
            <button
              className="btn btn-outline flex-1 justify-center"
              onClick={() => onOpenChat(lead)}
            >
              <Inbox size={14} /> Open Chat
            </button>
            <button
              className="btn btn-outline flex-1 justify-center"
              onClick={() => onEdit(lead)}
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              className="btn btn-outline justify-center text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]"
              onClick={() => onDelete(lead)}
              disabled={isDeleting}
              title="Delete lead"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </button>
          </div>
          <button className="btn btn-grad w-full justify-center">
            <Link size={14} /> Generate Checkout
          </button>
        </div>
      </div>
    </>
  );
}
