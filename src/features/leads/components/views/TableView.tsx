"use client";
import { useMemo } from "react";
import { pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import { Button } from "@/shared/ui/Button";
import { filterLeads } from "../../hooks/useLeads";
import type { Lead, LeadsFilter, LeadStatus } from "../../types";
import LeadStatusSelect from "../LeadStatusSelect";
import { Inbox, Pencil, Trash2 } from "lucide-react";

export default function TableView({
  leads,
  filter,
  onSelect,
  onStatusChange,
  onOpenChat,
  onEdit,
  onDelete,
  onBulkDelete,
  onExport,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
  onOpenChat: (l: Lead) => void;
  onEdit: (l: Lead) => void;
  onDelete: (l: Lead) => void;
  onBulkDelete: (rows: Lead[]) => void;
  onExport: (rows: Lead[]) => void;
}) {
  const filtered = useMemo(() => filterLeads(leads, filter), [leads, filter]);

  const columns: ColumnDef<Lead, unknown>[] = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (l) => l.name,
        header: "Name",
        enableSorting: true,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onSelect(l)}
            >
              <CRMAvatar name={l.name} size={30} />
              <div>
                <div className="font-medium text-[13px]">{l.name}</div>
                <div className="text-[11px] text-[var(--ink-mute)]">
                  {l.lastMsg.length > 40 ? l.lastMsg.slice(0, 40) + "…" : l.lastMsg}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "channel",
        accessorFn: (l) => l.channel,
        header: "Channel",
        enableSorting: true,
        cell: ({ row }) => <ChannelBadge channel={row.original.channel} size="xs" />,
      },
      {
        id: "status",
        accessorFn: (l) => l.status,
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <LeadStatusSelect
              value={row.original.status}
              onChange={(s) => onStatusChange(row.original.id, s)}
            />
          </div>
        ),
      },
      {
        id: "city",
        accessorFn: (l) => l.city,
        header: "City",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-[var(--ink-soft)]">{row.original.city}</span>
        ),
      },
      {
        id: "time",
        accessorFn: (l) => l.time,
        header: "Last activity",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-[var(--ink-mute)] text-[12px]">{row.original.time} ago</span>
        ),
      },
      {
        id: "value",
        accessorFn: (l) => l.value,
        header: "Est. value",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.value > 0 ? (
            <span className="font-[var(--font-mono)] font-medium">{pkr(row.original.value)}</span>
          ) : (
            <span className="text-[var(--ink-mute)]">—</span>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" title="Open chat" onClick={() => onOpenChat(l)}>
                <Inbox size={13} />
              </Button>
              <Button variant="ghost" size="icon" title="Edit" onClick={() => onEdit(l)}>
                <Pencil size={13} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Delete"
                className="text-[#DC2626]"
                onClick={() => onDelete(l)}
              >
                <Trash2 size={13} />
              </Button>
            </div>
          );
        },
      },
    ],
    [onSelect, onStatusChange, onOpenChat, onEdit, onDelete],
  );

  return (
    <DataTable
      data={filtered}
      columns={columns}
      selectable
      onDeleteSelected={onBulkDelete}
      onExport={onExport}
      emptyMessage="No matching leads."
      defaultPageSize={20}
      className="flex-1 min-h-0"
    />
  );
}
