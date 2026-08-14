"use client";
import { useAppStore } from "@/lib/appStore";
import { cn, pkr } from "@/lib/utils";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { ExportDialog } from "@/shared/ui/ExportDialog";
import { Input } from "@/shared/ui/Input";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import { StatCard } from "@/shared/ui/StatCard";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import {
  Download,
  Flame,
  Grid2x2,
  Layers,
  Loader2,
  Plus,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useOpenLeadChat } from "../hooks/useOpenLeadChat";
import {
  useAddLead,
  useArchiveLead,
  useDeleteLead,
  useInfiniteLeads,
  useLead,
  useRestoreLead,
  useUpdateLead,
  useUpdateLeadStatus,
} from "../hooks/useLeads";
import type { Lead, LeadStatus, LeadsFilter, LeadsView } from "../types";
import { downloadLeadsCsv } from "../utils/exportLeadsCsv";
import type { LeadFormData } from "../validations.lead";
import LeadDetailSheet from "./LeadDetailSheet";
import LeadFormDialog from "./LeadFormDialog";
import { LeadsBulkImportDialog } from "./LeadsBulkImportDialog";
import KanbanView from "./views/KanbanView";
import ListView from "./views/ListView";
import TableView from "./views/TableView";

// ──────────────────── LeadsView (root) ────────────────────
export function LeadsView() {
  const [archived, setArchived] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
    isFetching,
  } = useInfiniteLeads(archived);
  const leads = useMemo(() => data?.pages.flat() ?? [], [data]);
  const addLead = useAddLead();
  const updateLead = useUpdateLead();
  const updateStatus = useUpdateLeadStatus();
  const archiveLead = useArchiveLead();
  const restoreLead = useRestoreLead();
  const deleteLead = useDeleteLead();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportRows, setExportRows] = useState<Lead[]>([]);
  const openExport = (rows: Lead[]) => {
    setExportRows(rows);
    setExportOpen(true);
  };
  const { leadsView, setLeadsView } = useAppStore();

  const [filter, setFilter] = useState<LeadsFilter>({
    channel: "all",
    search: "",
  });
  const [selected, setSelected] = useState<Lead | null>(null);
  // Deep-link support: `/leads?lead=<id>` opens the detail sheet (e.g. from the inbox).
  const [leadParam, setLeadParam] = useUrlState("lead");
  const { data: paramLead } = useLead(leadParam || null);
  useEffect(() => {
    if (!leadParam) return;
    const resolved = leads.find((l) => l.id === leadParam) ?? paramLead ?? null;
    if (resolved && selected?.id !== resolved.id) setSelected(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadParam, leads, paramLead]);
  const closeSheet = () => {
    setSelected(null);
    setLeadParam("");
  };
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Lead | null>(null);
  const [createStatus, setCreateStatus] = useState<LeadStatus | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<Lead[]>([]);

  const hot = leads.filter((l: Lead) => l.status === "hot").length;
  const totalValue = leads.reduce(
    (a: number, l: Lead) => a + (l.value || 0),
    0,
  );

  const handleStatusChange = (id: string, status: LeadStatus) => {
    updateStatus.mutate({ id, status });
  };

  const openCreate = (status?: LeadStatus) => {
    setFormMode("create");
    setEditing(null);
    setCreateStatus(status);
    setFormOpen(true);
  };
  const openEdit = (lead: Lead) => {
    setFormMode("edit");
    setEditing(lead);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: LeadFormData) => {
    try {
      if (formMode === "edit" && editing) {
        await updateLead.mutateAsync({ id: editing.id, data });
      } else {
        await addLead.mutateAsync(data);
      }
      setFormOpen(false);
      setSelected(null);
    } catch {
      /* toast handled by hook */
    }
  };

  const handleArchive = (lead: Lead) => {
    archiveLead.mutate(lead.id, { onSuccess: () => setSelected(null) });
  };

  const handleRestore = (lead: Lead) => {
    restoreLead.mutate(lead.id, { onSuccess: () => setSelected(null) });
  };

  const handleDelete = (lead: Lead) => setDeleteTarget(lead);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteLead.mutate(deleteTarget.id, {
      onSuccess: () => {
        setSelected(null);
        setDeleteTarget(null);
      },
    });
  };

  const confirmBulkDelete = () => {
    bulkDeleteTargets.forEach((lead) => deleteLead.mutate(lead.id));
    setBulkDeleteTargets([]);
    setSelected(null);
  };

  const {
    openLeadChat,
    verifyingLeadId,
    unreachableMessage,
    dismissUnreachableMessage,
  } = useOpenLeadChat();

  const isSavingForm = addLead.isPending || updateLead.isPending;

  const VIEW_BTNS: { id: LeadsView; label: string; Icon: React.ElementType }[] =
    [
      { id: "kanban", label: "Kanban", Icon: Layers },
      // { id: "list", label: "List", Icon: List },
      { id: "table", label: "Table", Icon: Grid2x2 },
    ];

  const CHANNEL_TABS = [
    { id: "all", label: "All" },
    { id: "wa", label: "WhatsApp" },
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="page-header flex items-center justify-between gap-3.5 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Leads pipeline</h2>
          <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
            Track and convert your pipeline
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <RefreshButton
            onRefresh={() => refetch()}
            isRefreshing={isFetching}
          />
          <PermissionGuard permission="leads:export">
            <Button variant="outline" onClick={() => openExport(leads)}>
              <Download size={13} /> Export
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="leads:create">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Layers size={13} /> Import
            </Button>
            <Button onClick={() => openCreate()}>
              <Plus size={13} /> Add lead
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Total leads" value={leads.length} Icon={Users} />
        <StatCard label="Hot leads" value={hot} Icon={Flame} accent="#EF4444" />
        <StatCard
          label="Projected value"
          value={pkr(totalValue)}
          Icon={TrendingUp}
        />
      </div>

      {/* Toolbar */}
      <div className="card leads-toolbar flex items-center gap-2 flex-wrap p-2">
        <div className="relative w-full flex-none md:flex-[1_1_220px] md:w-auto md:min-w-[200px]">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none z-10"
          />
          <Input
            className="pl-8"
            placeholder="Search leads..."
            value={filter.search}
            onChange={(e) =>
              setFilter((f) => ({ ...f, search: e.target.value }))
            }
          />
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={filter.channel}
          onValueChange={(v) => {
            if (v)
              setFilter((f) => ({
                ...f,
                channel: v as LeadsFilter["channel"],
              }));
          }}
        >
          {CHANNEL_TABS.map((c) => (
            <ToggleGroupItem key={c.id} value={c.id}>
              {c.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={archived ? "archived" : "active"}
          onValueChange={(v) => {
            if (v) setArchived(v === "archived");
          }}
        >
          <ToggleGroupItem value="active">Active</ToggleGroupItem>
          <ToggleGroupItem value="archived">Archived</ToggleGroupItem>
        </ToggleGroup>
        <div className="hidden md:block md:flex-1" />
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={leadsView}
          onValueChange={(v) => {
            if (v) setLeadsView(v as LeadsView);
          }}
        >
          {VIEW_BTNS.map(({ id, label, Icon }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              title={label}
              // Kanban isn't usable on phones — hide the toggle there.
              className={cn(id === "kanban" && "hidden md:inline-flex")}
            >
              <Icon size={12} /> {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-[var(--ink-mute)]">
          Loading leads…
        </div>
      )}

      {!isLoading && leadsView === "kanban" && (
        <>
          {/* Kanban on desktop; phones fall back to the table view. */}
          <div className="hidden md:flex md:flex-col flex-1 min-h-0">
            <KanbanView
              leads={leads}
              filter={filter}
              onSelect={setSelected}
              onStatusChange={handleStatusChange}
              onAddLead={openCreate}
            />
          </div>
          <div className="flex md:hidden flex-col flex-1 min-h-0">
            <TableView
              leads={leads}
              filter={filter}
              archived={archived}
              onSelect={setSelected}
              onStatusChange={handleStatusChange}
              onOpenChat={openLeadChat}
              openingChatLeadId={verifyingLeadId}
              onEdit={openEdit}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={handleDelete}
              onBulkDelete={setBulkDeleteTargets}
              onExport={openExport}
            />
          </div>
        </>
      )}
      {!isLoading && leadsView === "list" && (
        <ListView
          leads={leads}
          filter={filter}
          archived={archived}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
          onOpenChat={openLeadChat}
          openingChatLeadId={verifyingLeadId}
          onEdit={openEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
      {!isLoading && leadsView === "table" && (
        <TableView
          leads={leads}
          filter={filter}
          archived={archived}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
          onOpenChat={openLeadChat}
          openingChatLeadId={verifyingLeadId}
          onEdit={openEdit}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
          onBulkDelete={setBulkDeleteTargets}
          onExport={openExport}
        />
      )}

      {!isLoading && hasNextPage && (
        <div className="flex justify-center py-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <Loader2 size={13} className="animate-spin" />
            ) : null}
            Load more leads
          </Button>
        </div>
      )}

      <LeadDetailSheet
        lead={selected}
        archived={archived}
        onClose={closeSheet}
        onEdit={openEdit}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDelete={handleDelete}
        onOpenChat={openLeadChat}
        isOpeningChat={verifyingLeadId === selected?.id}
        isDeleting={deleteLead.isPending}
      />
      <LeadFormDialog
        open={formOpen}
        mode={formMode}
        initial={editing}
        defaultStatus={createStatus}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        isSaving={isSavingForm}
      />
      <LeadsBulkImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />
      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirm={(name) => downloadLeadsCsv(exportRows, name)}
        defaultName={`leads_export_${new Date().toISOString().split("T")[0]}`}
        count={exportRows.length}
        title="Export leads"
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete lead permanently?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed, along with their orders, appointments, qualification answers and chat history. This can't be undone — archive the lead instead if you may need any of it.`
            : undefined
        }
        confirmLabel="Delete permanently"
        loading={deleteLead.isPending}
      />
      <ConfirmDialog
        open={!!unreachableMessage}
        onClose={dismissUnreachableMessage}
        onConfirm={dismissUnreachableMessage}
        title="Number Not Registered"
        description={unreachableMessage ?? undefined}
        confirmLabel="Got it"
        cancelLabel="Close"
        destructive
      />
      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={confirmBulkDelete}
        title={`Delete ${bulkDeleteTargets.length} lead${bulkDeleteTargets.length === 1 ? "" : "s"}?`}
        description="The selected leads will be permanently removed, along with their orders, appointments, qualification answers and chat history. This can't be undone."
        confirmLabel="Delete leads"
        loading={deleteLead.isPending}
      />
    </div>
  );
}
