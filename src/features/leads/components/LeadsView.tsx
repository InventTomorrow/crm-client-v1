"use client";
import { useAppStore } from "@/lib/appStore";
import { pkr } from "@/lib/utils";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Download, Grid2x2, Layers, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useAddLead,
  useDeleteLead,
  useLeads,
  useUpdateLead,
  useUpdateLeadStatus,
} from "../hooks/useLeads";
import type { Lead, LeadStatus, LeadsFilter, LeadsView } from "../types";
import { downloadLeadsCsv } from "../utils/exportLeadsCsv";
import { ExportLeadsDialog } from "./ExportLeadsDialog";
import LeadDetailSheet from "./LeadDetailSheet";
import LeadFormDialog, { type LeadFormData } from "./LeadFormDialog";
import { LeadsBulkImportDialog } from "./LeadsBulkImportDialog";
import KanbanView from "./views/KanbanView";
import ListView from "./views/ListView";
import TableView from "./views/TableView";

// ──────────────────── LeadsView (root) ────────────────────
export function LeadsView() {
  const router = useRouter();
  const { data: leads = [], isLoading } = useLeads();
  const addLead = useAddLead();
  const updateLead = useUpdateLead();
  const updateStatus = useUpdateLeadStatus();
  const deleteLead = useDeleteLead();
  const [exportOpen, setExportOpen] = useState(false);
  const { leadsView, setLeadsView } = useAppStore();

  const [filter, setFilter] = useState<LeadsFilter>({
    channel: "all",
    search: "",
  });
  const [selected, setSelected] = useState<Lead | null>(null);
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

  const handleOpenChat = (lead: Lead) => {
    router.push(`/inbox?lead=${lead.id}`);
  };

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
    { id: "ig", label: "Instagram" },
    { id: "fb", label: "Facebook" },
  ];

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="page-header flex items-center justify-between gap-3.5 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Leads pipeline</h2>
          <div className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
            {leads.length} leads · {hot} hot · {pkr(totalValue)} projected
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <button
            className="btn btn-outline"
            onClick={() => setExportOpen(true)}
          >
            <Download size={13} /> Export
          </button>
          <button
            className="btn btn-outline"
            onClick={() => setImportOpen(true)}
          >
            <Layers size={13} /> Import
          </button>
          <button className="btn btn-grad" onClick={() => openCreate()}>
            <Plus size={13} /> Add lead
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card leads-toolbar flex items-center gap-2 flex-wrap p-2">
        <div className="relative flex-[1_1_220px] min-w-[200px]">
          <Search
            size={13}
            className="absolute left-2.5 top-2.5 text-[var(--ink-mute)]"
          />
          <input
            className="input pl-8"
            placeholder="Search leads..."
            value={filter.search}
            onChange={(e) =>
              setFilter((f) => ({ ...f, search: e.target.value }))
            }
          />
        </div>
        <div className="seg">
          {CHANNEL_TABS.map((c) => (
            <button
              key={c.id}
              className={filter.channel === c.id ? "on" : ""}
              onClick={() =>
                setFilter((f) => ({
                  ...f,
                  channel: c.id as LeadsFilter["channel"],
                }))
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="seg">
          {VIEW_BTNS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={leadsView === id ? "on" : ""}
              onClick={() => setLeadsView(id)}
              title={label}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex-1 flex items-center justify-center text-[var(--ink-mute)]">
          Loading leads…
        </div>
      )}

      {!isLoading && leadsView === "kanban" && (
        <KanbanView
          leads={leads}
          filter={filter}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
          onAddLead={openCreate}
        />
      )}
      {!isLoading && leadsView === "list" && (
        <ListView
          leads={leads}
          filter={filter}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
          onOpenChat={handleOpenChat}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}
      {!isLoading && leadsView === "table" && (
        <TableView
          leads={leads}
          filter={filter}
          onSelect={setSelected}
          onStatusChange={handleStatusChange}
          onOpenChat={handleOpenChat}
          onEdit={openEdit}
          onDelete={handleDelete}
          onBulkDelete={setBulkDeleteTargets}
          onExport={downloadLeadsCsv}
        />
      )}

      <LeadDetailSheet
        lead={selected}
        onClose={() => setSelected(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onOpenChat={handleOpenChat}
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
      <ExportLeadsDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        leads={leads}
      />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete lead?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be permanently removed. This can't be undone.`
            : undefined
        }
        confirmLabel="Delete lead"
        loading={deleteLead.isPending}
      />
      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={confirmBulkDelete}
        title={`Delete ${bulkDeleteTargets.length} lead${bulkDeleteTargets.length === 1 ? "" : "s"}?`}
        description="The selected leads will be permanently removed. This can't be undone."
        confirmLabel="Delete leads"
        loading={deleteLead.isPending}
      />
    </div>
  );
}
