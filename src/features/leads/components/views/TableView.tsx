"use client";
import { useMemo } from "react";
import { pkr } from "@/lib/utils";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import { Button } from "@/shared/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { filterLeads } from "../../hooks/useLeads";
import type { Lead, LeadsFilter, LeadStatus } from "../../types";
import { useLeadVocabulary } from "../../utils/leadVocabulary";
import LeadStatusSelect from "../LeadStatusSelect";
import {
  Archive,
  ArchiveRestore,
  Inbox,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

export default function TableView({
  leads,
  filter,
  archived = false,
  onSelect,
  onStatusChange,
  onOpenChat,
  openingChatLeadId = null,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onBulkDelete,
  onExport,
}: {
  leads: Lead[];
  filter: LeadsFilter;
  archived?: boolean;
  onSelect: (l: Lead) => void;
  onStatusChange: (id: string, s: LeadStatus) => void;
  onOpenChat: (l: Lead) => void;
  /** Lead whose WhatsApp number is being verified before the inbox opens. */
  openingChatLeadId?: string | null;
  onEdit: (l: Lead) => void;
  onArchive: (l: Lead) => void;
  onRestore: (l: Lead) => void;
  onDelete: (l: Lead) => void;
  onBulkDelete: (rows: Lead[]) => void;
  onExport: (rows: Lead[]) => void;
}) {
  const vocabulary = useLeadVocabulary();
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
        accessorFn: (l) => l.lastContactedAt ?? "",
        header: "Last activity",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-[var(--ink-mute)] text-[12px]">{row.original.time}</span>
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
        header: "",
        size: 56,
        enableSorting: false,
        cell: ({ row }) => {
          const l = row.original;
          const isOpeningChat = openingChatLeadId === l.id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${l.name}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isOpeningChat ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <MoreVertical size={15} />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem
                  disabled={openingChatLeadId !== null}
                  onSelect={() => onOpenChat(l)}
                >
                  <Inbox size={13} /> Open chat
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(l)}>
                  <Pencil size={13} /> Edit
                </DropdownMenuItem>
                {archived ? (
                  <DropdownMenuItem onSelect={() => onRestore(l)}>
                    <ArchiveRestore size={13} /> Restore
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => onArchive(l)}>
                    <Archive size={13} /> Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem variant="destructive" onSelect={() => onDelete(l)}>
                  <Trash2 size={13} /> Delete permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      archived,
      onSelect,
      onStatusChange,
      onOpenChat,
      openingChatLeadId,
      onEdit,
      onArchive,
      onRestore,
      onDelete,
    ],
  );

  return (
    <DataTable
      data={filtered}
      columns={columns}
      selectable
      onDeleteSelected={onBulkDelete}
      onExport={onExport}
      emptyMessage={`No matching ${vocabulary.plural}.`}
      defaultPageSize={20}
      className="flex-1 min-h-0"
    />
  );
}
