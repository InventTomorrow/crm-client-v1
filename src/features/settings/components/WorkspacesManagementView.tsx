"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import {
  useCreateTenant,
  useDeleteTenant,
  useSwitchWorkspace,
} from "@/features/tenant/hooks/useTenant";
import { useAppStore } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  AlertTriangle,
  ArrowRightLeft,
  Building2,
  Check,
  Crown,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";

// ─────────────────────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────────────────────
const PALETTE = [
  "linear-gradient(135deg,#FBBF24,#F472B6)",
  "linear-gradient(135deg,#34D399,#0EA5E9)",
  "linear-gradient(135deg,#A78BFA,#22D3EE)",
  "linear-gradient(135deg,#F472B6,#7C3AED)",
  "linear-gradient(135deg,#FCD34D,#F87171)",
  "linear-gradient(135deg,#6EE7B7,#818CF8)",
];

// ─────────────────────────────────────────────────────────────
// Create Workspace Dialog
// ─────────────────────────────────────────────────────────────
function CreateWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const { mutate: createTenant, isPending } = useCreateTenant();

  const handleCreate = () => {
    if (!name.trim()) return;
    createTenant({ name: name.trim() }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[460px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center">
              <Building2 size={18} className="text-[var(--accent)]" />
            </div>
            <div>
              <DialogTitle className="text-[16px] font-semibold">
                New Workspace
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                Isolated data, members, and billing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[var(--ink-soft)] mb-1.5">
              Workspace name <span className="text-red-500">*</span>
            </label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karachi Branch, Q2 Ops…"
              autoFocus
              disabled={isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3.5 text-[12px] text-[var(--ink-soft)] leading-relaxed">
            <span className="font-semibold text-[var(--ink)]">
              You'll be the Owner
            </span>{" "}
            — invite your team after creation. Workspace data is fully isolated
            from your other workspaces.
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--line)] flex justify-end gap-2">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="btn btn-grad"
            onClick={handleCreate}
            disabled={!name.trim() || isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus size={13} /> Create workspace
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Confirm Dialog
// ─────────────────────────────────────────────────────────────
function DeleteConfirmDialog({
  workspaceName,
  onConfirm,
  onClose,
  isPending,
}: {
  workspaceName: string;
  onConfirm: () => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [typed, setTyped] = useState("");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-[420px] p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-6 py-5 border-b border-[var(--line)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-red-100">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <DialogTitle className="text-[16px] font-semibold">
                Delete Workspace
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                This action is permanent and irreversible.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="p-6 flex flex-col gap-3.5">
          <p className="text-[13px] text-[var(--ink-soft)] leading-relaxed">
            Deleting{" "}
            <strong className="text-[var(--ink)]">{workspaceName}</strong> will
            permanently remove all its leads, messages, inventory, and team
            members. This cannot be undone.
          </p>
          <div>
            <label className="block text-[12px] font-semibold text-[var(--ink-soft)] mb-1.5">
              Type{" "}
              <span className="font-mono text-red-500">{workspaceName}</span> to
              confirm
            </label>
            <input
              className="input border-red-200 focus:border-red-400"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={workspaceName}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-[var(--line)] flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white rounded-[10px] px-4 py-2 text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onConfirm}
            disabled={typed !== workspaceName || isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Deleting…
              </>
            ) : (
              <>
                <Trash2 size={13} /> Delete workspace
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Workspace Card
// ─────────────────────────────────────────────────────────────
function WorkspaceCard({
  membership,
  index,
  isActive,
  onSwitch,
  onDelete,
}: {
  membership: {
    id: string;
    role: { id: string; name: string };
    tenant: { id: string; name: string; type: string };
    isActive?: boolean;
  };
  index: number;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}) {
  const color = PALETTE[index % PALETTE.length];
  const short = membership.tenant.name.substring(0, 2).toUpperCase();
  const isOwner = membership.role.name.toLowerCase() === "owner";
  const plan =
    membership.tenant.type === "INDIVIDUAL" ? "Individual" : "Organization";

  return (
    <div
      className={cn(
        "card p-5 flex flex-col gap-4 transition-all duration-200 relative overflow-hidden",
        isActive
          ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent),var(--shadow-2)]"
          : "hover:shadow-[var(--shadow-2)]",
      )}
    >
      {/* Active badge */}
      {isActive && (
        <div className="absolute top-3.5 right-3.5">
          <span className="badge text-[11px] font-semibold bg-[var(--accent)] text-white flex items-center gap-1">
            <Check size={10} /> Active
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3.5 pr-14">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0"
          style={{ background: color }}
        >
          {short}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[15px] text-[var(--ink)] truncate">
            {membership.tenant.name}
          </div>
          <div className="text-[12px] text-[var(--ink-mute)] mt-0.5 flex items-center gap-1.5">
            {isOwner ? (
              <Crown size={11} className="text-amber-500" />
            ) : (
              <Shield size={11} className="text-[var(--accent)]" />
            )}
            <span>{membership.role.name}</span>
            <span>·</span>
            <span>{plan}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--line)]" />

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: "Members", value: "—" },
          { icon: Building2, label: "Type", value: plan },
          { icon: Shield, label: "Role", value: membership.role.name },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg bg-[var(--surface-2)] p-2.5 text-center"
          >
            <Icon size={13} className="text-[var(--ink-mute)] mx-auto mb-1" />
            <div className="text-[12.5px] font-semibold text-[var(--ink)]">
              {value}
            </div>
            <div className="text-[10.5px] text-[var(--ink-mute)]">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isActive && (
          <button
            className="btn btn-outline flex-1 justify-center text-[12.5px]"
            onClick={onSwitch}
          >
            <ArrowRightLeft size={13} /> Switch to this
          </button>
        )}
        {isActive && (
          <div className="flex-1 rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)] text-[12.5px] font-medium flex items-center justify-center gap-1.5 py-2 px-3">
            <Check size={13} /> Currently active
          </div>
        )}
        {isOwner && (
          <button
            className="btn btn-outline px-2.5 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            onClick={onDelete}
            title="Delete workspace"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────
export function WorkspacesManagementView() {
  const { user, isLoading } = useMe();
  const { currentWorkspaceId } = useAppStore();
  const { mutate: switchWorkspace, isPending: isSwitching } =
    useSwitchWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeleting } = useDeleteTenant();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const memberships = user?.memberships ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
          <span className="text-[13px] text-[var(--ink-mute)]">
            Loading workspaces…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-[18px] h-full overflow-y-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold text-[var(--ink)]">
            Workspaces
          </h2>
          <p className="text-[13px] text-[var(--ink-mute)] mt-0.5">
            {memberships.length} workspace{memberships.length !== 1 ? "s" : ""}{" "}
            · each with isolated data and members
          </p>
        </div>
        <button className="btn btn-grad" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> New workspace
        </button>
      </div>

      {/* Stats banner */}
      <div className="card p-4 bg-gradient-to-r from-[var(--accent)] to-[#4FC3F7] text-white border-none overflow-hidden relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
          <Building2 size={80} />
        </div>
        <div className="grid grid-cols-3 gap-6 relative z-10">
          {[
            { label: "Total workspaces", value: memberships.length },
            {
              label: "Owned by you",
              value: memberships.filter(
                (m: any) => m.role.name.toLowerCase() === "owner",
              ).length,
            },
            {
              label: "Member of",
              value: memberships.filter(
                (m: any) => m.role.name.toLowerCase() !== "owner",
              ).length,
            },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[26px] font-bold tracking-tight">
                {value}
              </div>
              <div className="text-[12px] text-white/70 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Workspace grid */}
      {memberships.length === 0 ? (
        <div className="card flex flex-col items-center justify-center gap-4 py-14">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center">
            <Building2 size={26} className="text-[var(--accent)]" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-[15px] text-[var(--ink)]">
              No workspaces yet
            </div>
            <div className="text-[13px] text-[var(--ink-mute)] mt-1">
              Create your first workspace to get started.
            </div>
          </div>
          <button className="btn btn-grad" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {memberships.map((m: any, idx: number) => (
            <WorkspaceCard
              key={m.tenant.id}
              membership={m}
              index={idx}
              isActive={m.tenant.id === currentWorkspaceId}
              onSwitch={() => {
                if (!isSwitching) {
                  switchWorkspace({
                    tenantId: m.tenant.id,
                    tenantName: m.tenant.name,
                  });
                }
              }}
              onDelete={() =>
                setDeleteTarget({ id: m.tenant.id, name: m.tenant.name })
              }
            />
          ))}

          {/* Create new card */}
          <button
            onClick={() => setShowCreate(true)}
            className="card flex flex-col items-center justify-center gap-3 py-12 border-dashed border-2 border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all duration-200 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] group-hover:bg-white flex items-center justify-center border border-dashed border-[var(--line)] group-hover:border-[var(--accent)] transition-all">
              <Plus
                size={20}
                className="text-[var(--ink-mute)] group-hover:text-[var(--accent)] transition-colors"
              />
            </div>
            <div className="text-center">
              <div className="font-semibold text-[13.5px] text-[var(--ink-mute)] group-hover:text-[var(--accent)] transition-colors">
                Create workspace
              </div>
              <div className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                Add a new isolated workspace
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Dialogs */}
      {showCreate && (
        <CreateWorkspaceDialog onClose={() => setShowCreate(false)} />
      )}
      {deleteTarget && (
        <DeleteConfirmDialog
          workspaceName={deleteTarget.name}
          isPending={isDeleting}
          onConfirm={() => {
            deleteWorkspace(deleteTarget.id, {
              onSuccess: () => setDeleteTarget(null),
            });
          }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
