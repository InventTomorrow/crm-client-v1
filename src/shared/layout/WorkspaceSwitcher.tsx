"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import {
  useCreateTenant,
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
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Membership = {
  tenant: { id: string; name: string; type: string };
  role: { name: string };
};

// ─────────────────────────────────────────────────────────────
// Create Dialog — calls real API
// ─────────────────────────────────────────────────────────────
function CreateDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const { mutate: createTenant, isPending } = useCreateTenant();

  const handleCreate = () => {
    if (!name.trim()) return;
    createTenant({ name: name.trim() }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[440px] overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="px-5 py-4 border-b border-[var(--line)]">
          <DialogTitle className="text-[16px] font-semibold">
            Create new workspace
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[var(--ink-mute)] mt-0.5">
            Each workspace has isolated data, members, and billing.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-3.5">
          <div>
            <label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Workspace name
            </label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karachi Karahi Co."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              disabled={isPending}
            />
          </div>
          <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed">
            You&apos;ll be the <strong>Owner</strong> of this workspace. Team members
            can be invited after setup.
          </p>
        </div>

        <div className="px-[14px] py-[14px] border-t border-[var(--line)] flex justify-end gap-2">
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
// Colour palette helper
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
// WorkspaceSwitcher
// ─────────────────────────────────────────────────────────────
export function WorkspaceSwitcher({ collapsed }: { collapsed: boolean }) {
  const { currentWorkspaceId } = useAppStore();
  const { user } = useMe();
  const { isOwner } = usePermissions();
  const { mutate: switchWorkspace, isPending: isSwitching } =
    useSwitchWorkspace();

  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const memberships = user?.memberships ?? [];

  const currentMembership =
    memberships.find(
      (membership: Membership) => membership.tenant.id === currentWorkspaceId,
    ) ?? memberships[0];

  if (!currentMembership) return null;

  const getDisplay = (m: Membership, idx: number) => ({
    id: m.tenant.id,
    name: m.tenant.name,
    short: m.tenant.name.substring(0, 2).toUpperCase(),
    plan: m.tenant.type === "INDIVIDUAL" ? "Individual" : "Organization",
    role: m.role.name,
    color: PALETTE[idx % PALETTE.length],
  });

  const currentIdx = memberships.findIndex(
    (membership: Membership) => membership.tenant.id === currentMembership.tenant.id,
  );
  const current = getDisplay(
    currentMembership,
    currentIdx < 0 ? 0 : currentIdx,
  );

  const handleSwitch = (membership: Membership) => {
    if (membership.tenant.id === currentWorkspaceId) {
      setOpen(false);
      return;
    }
    setOpen(false);
    switchWorkspace({
      tenantId: membership.tenant.id,
      tenantName: membership.tenant.name,
    });
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative",
        collapsed ? "px-[10px] py-[14px]" : "px-3 py-[14px]",
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isSwitching}
        className={cn(
          "w-full flex items-center gap-2.5 border border-[var(--line)] rounded-[10px] cursor-pointer font-[inherit] transition-colors",
          collapsed ? "justify-center p-1.5" : "justify-start px-[10px] py-2",
          open
            ? "bg-[var(--surface-2)]"
            : "bg-[var(--surface)] hover:bg-[var(--surface-2)]",
          isSwitching && "opacity-60 cursor-not-allowed",
        )}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold text-[12px] flex-shrink-0"
          style={{ background: current.color }}
        >
          {isSwitching ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            current.short
          )}
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 text-left">
              <div className="font-semibold text-[13px] text-[var(--ink)] truncate">
                {current.name}
              </div>
              <div className="text-[11px] text-[var(--ink-mute)] flex items-center gap-1 mt-px">
                <span>{current.plan}</span>
                <span>·</span>
                <span>{current.role}</span>
              </div>
            </div>
            <ChevronDown
              size={13}
              className={cn(
                "text-[var(--ink-mute)] transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="card-2 fade-up absolute z-[80] bg-[var(--surface)] p-1.5 overflow-hidden"
          style={{
            left: collapsed ? "calc(100% + 8px)" : 12,
            right: collapsed ? "auto" : 12,
            top: collapsed ? 14 : "calc(100% - 4px)",
            width: collapsed ? 280 : "auto",
          }}
        >
          <div className="px-[10px] pt-2 pb-1.5 text-[10.5px] text-[var(--ink-mute)] uppercase tracking-[0.08em] font-semibold">
            Switch workspace
          </div>

          {memberships.map((membership: Membership, index: number) => {
            const workspace = getDisplay(membership, index);
            const isActive = workspace.id === currentWorkspaceId;
            return (
              <button
                key={workspace.id}
                onClick={() => handleSwitch(membership)}
                className={cn(
                  "flex items-center gap-2.5 w-full px-[10px] py-2 border-none bg-transparent cursor-pointer rounded-lg text-left font-[inherit] hover:bg-[var(--accent-soft)] transition-colors",
                  isActive && "bg-[var(--accent-soft)]",
                )}
              >
                <div
                  className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-white font-semibold text-[11.5px] flex-shrink-0"
                  style={{ background: workspace.color }}
                >
                  {workspace.short}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--ink)]">
                    {workspace.name}
                  </div>
                  <div className="text-[11px] text-[var(--ink-mute)]">
                    {workspace.plan} · {workspace.role}
                  </div>
                </div>
                {isActive && (
                  <Check
                    size={14}
                    className="text-[var(--accent)] flex-shrink-0"
                  />
                )}
              </button>
            );
          })}

          {isOwner && (
            <>
              <div className="h-px bg-[var(--line)] my-1" />

              <button
                onClick={() => {
                  setOpen(false);
                  setShowCreate(true);
                }}
                className="flex items-center gap-2.5 w-full px-[10px] py-2 border-none bg-transparent cursor-pointer rounded-lg text-left font-[inherit] text-[var(--accent)] text-[13px] font-medium hover:bg-[var(--accent-soft)] transition-colors"
              >
                <span className="w-[30px] h-[30px] rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-dashed border-[var(--accent)]">
                  <Plus size={14} />
                </span>
                Create new workspace
              </button>
            </>
          )}
        </div>
      )}

      {showCreate && <CreateDialog onClose={() => setShowCreate(false)} />}
    </div>
  );
}
