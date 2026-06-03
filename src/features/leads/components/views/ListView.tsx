"use client";
import { Inbox, MapPin, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import { filterLeads } from "../../hooks/useLeads";
import type { Lead, LeadsFilter, LeadStatus } from "../../types";
import { STATUS_META } from "../../types";
import LeadStatusSelect from "../LeadStatusSelect";

// ──────────────────── List View ────────────────────
export default function ListView({
  leads,
  filter,
  onSelect,
  onStatusChange,
  onOpenChat,
  onEdit,
  onDelete,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
  onOpenChat: (l: Lead) => void;
  onEdit: (l: Lead) => void;
  onDelete: (l: Lead) => void;
}) {
  const filtered = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  return (
    <div className="scroll flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
      {filtered.map((l) => {
        const statusMeta = STATUS_META[l.status];
        return (
          <div
            key={l.id}
            className="card flex items-center gap-3.5 cursor-pointer p-3"
            onClick={() => onSelect(l)}
            style={{ borderLeft: `3px solid ${statusMeta.color}` }}
          >
            <CRMAvatar name={l.name} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[14px]">{l.name}</span>
                <ChannelBadge channel={l.channel} size="xs" />
                {l.status === "hot" && <span className="dot dot-hot pulse-hot" />}
              </div>
              <div className="text-[12.5px] mt-0.5 truncate text-[var(--ink-soft)]">
                {l.lastMsg}
              </div>
              <div className="text-[11px] mt-1 flex items-center gap-2 text-[var(--ink-mute)]">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={10} />
                  {l.city}
                </span>
                <span>·</span>
                <span>{l.time} ago</span>
                {l.value > 0 && (
                  <>
                    <span>·</span>
                    <span className="font-[var(--font-mono)] text-[var(--ink-soft)]">
                      {pkr(l.value)}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div
              className="flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <LeadStatusSelect
                value={l.status}
                onChange={(s) => onStatusChange(l.id, s)}
              />
              <button
                className="btn btn-ghost p-1.5"
                title="Edit lead"
                onClick={() => onEdit(l)}
              >
                <Pencil size={13} />
              </button>
              <button
                className="btn btn-ghost p-1.5 text-[#DC2626]"
                title="Delete lead"
                onClick={() => onDelete(l)}
              >
                <Trash2 size={13} />
              </button>
              <button
                className="btn btn-outline py-[5px] px-[10px]"
                onClick={() => onOpenChat(l)}
              >
                <Inbox size={12} /> Open
              </button>
            </div>
          </div>
        );
      })}
      {filtered.length === 0 && (
        <div className="card p-10 text-center text-[var(--ink-mute)]">
          No matching leads.
        </div>
      )}
    </div>
  );
}
