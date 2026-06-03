"use client";
import { Inbox, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import { filterLeads } from "../../hooks/useLeads";
import type { Lead, LeadsFilter, LeadStatus } from "../../types";
import LeadStatusSelect from "../LeadStatusSelect";

// ──────────────────── Table View ────────────────────
export default function TableView({
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
    <div className="card overflow-auto flex-1 min-h-0">
      <table className="tbl">
        <thead>
          <tr>
            <th className="min-w-[200px]">Name</th>
            <th>Channel</th>
            <th>Status</th>
            <th>City</th>
            <th>Last activity</th>
            <th className="text-right">Est. value</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((l) => (
            <tr key={l.id} onClick={() => onSelect(l)} className="cursor-pointer">
              <td>
                <div className="flex items-center gap-2.5">
                  <CRMAvatar name={l.name} size={30} />
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-[11px] text-[var(--ink-mute)]">
                      {l.lastMsg.length > 40
                        ? l.lastMsg.slice(0, 40) + "…"
                        : l.lastMsg}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <ChannelBadge channel={l.channel} size="xs" />
              </td>
              <td>
                <LeadStatusSelect
                  value={l.status}
                  onChange={(s) => onStatusChange(l.id, s)}
                />
              </td>
              <td className="text-[var(--ink-soft)]">{l.city}</td>
              <td className="text-[var(--ink-mute)] text-[12px]">
                {l.time} ago
              </td>
              <td className="text-right font-[var(--font-mono)] font-medium">
                {l.value > 0 ? (
                  pkr(l.value)
                ) : (
                  <span className="text-[var(--ink-mute)]">—</span>
                )}
              </td>
              <td className="text-right" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-ghost p-1.5"
                  title="Open chat"
                  onClick={() => onOpenChat(l)}
                >
                  <Inbox size={13} />
                </button>
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
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center text-[var(--ink-mute)] p-8">
                No matching leads.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
