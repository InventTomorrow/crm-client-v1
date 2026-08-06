"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useSwitchWorkspace } from "@/features/tenant/hooks/useTenant";
import { useAppStore } from "@/lib/appStore";
import {
  getBusinessVerticalShortLabel,
  type BusinessVertical,
} from "@/lib/business-verticals";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { Check, ChevronDown, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { CreateWorkspaceDialog } from "./CreateWorkspaceDialog";

type Membership = {
  tenant: {
    id: string;
    name: string;
    type: string;
    businessVertical: BusinessVertical;
  };
  role: { name: string };
};

const PALETTE = [
  "linear-gradient(135deg,#FBBF24,#F472B6)",
  "linear-gradient(135deg,#34D399,#0EA5E9)",
  "linear-gradient(135deg,#A78BFA,#22D3EE)",
  "linear-gradient(135deg,#F472B6,#7C3AED)",
  "linear-gradient(135deg,#FCD34D,#F87171)",
  "linear-gradient(135deg,#6EE7B7,#818CF8)",
];

/**
 * Workspace picker built on the Radix dropdown primitive, so open/close is
 * animated (fade + zoom + slide) and positioning/dismissal are handled for us.
 * The hand-rolled variant in WorkspaceSwitcher.tsx is kept for now in case we
 * need to switch back.
 */
export function WorkspaceSwitcherV2({ collapsed }: { collapsed: boolean }) {
  const { currentWorkspaceId } = useAppStore();
  const { user } = useMe();
  const { isOwner } = usePermissions();
  const { mutate: switchWorkspace, isPending: isSwitching } =
    useSwitchWorkspace();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const memberships: Membership[] = user?.memberships ?? [];
  const currentMembership =
    memberships.find(
      (membership) => membership.tenant.id === currentWorkspaceId,
    ) ?? memberships[0];

  if (!currentMembership) return null;

  const getDisplay = (membership: Membership, index: number) => ({
    id: membership.tenant.id,
    name: membership.tenant.name,
    short: membership.tenant.name.substring(0, 2).toUpperCase(),
    category: getBusinessVerticalShortLabel(membership.tenant.businessVertical),
    role: membership.role.name,
    color: PALETTE[index % PALETTE.length],
  });

  const currentIndex = memberships.findIndex(
    (membership) => membership.tenant.id === currentMembership.tenant.id,
  );
  const current = getDisplay(
    currentMembership,
    currentIndex < 0 ? 0 : currentIndex,
  );

  const handleSwitch = (membership: Membership) => {
    if (membership.tenant.id === currentWorkspaceId) return;
    switchWorkspace({
      tenantId: membership.tenant.id,
      tenantName: membership.tenant.name,
    });
  };

  // Keep the original index so each workspace keeps a stable colour.
  const indexed = memberships.map((membership, index) => ({
    membership,
    index,
  }));
  const ownedGroup = indexed.filter(
    ({ membership }) => membership.role.name === "OWNER",
  );
  const joinedGroup = indexed.filter(
    ({ membership }) => membership.role.name !== "OWNER",
  );

  const renderWorkspaceRow = ({
    membership,
    index,
  }: {
    membership: Membership;
    index: number;
  }) => {
    const workspace = getDisplay(membership, index);
    const isActive = workspace.id === currentWorkspaceId;
    return (
      <DropdownMenuItem
        key={workspace.id}
        onSelect={() => handleSwitch(membership)}
        className="gap-2.5 px-[10px] py-2 data-disabled:opacity-100"
      >
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-white font-semibold text-[11.5px] flex-shrink-0"
          style={{ background: workspace.color }}
        >
          {workspace.short}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-[var(--ink)] truncate">
            {workspace.name}
          </div>
          <div className="text-[11px] text-[var(--ink-mute)] truncate">
            {workspace.category} · {workspace.role}
          </div>
        </div>
        {isActive && (
          <Check size={14} className="text-[var(--accent)] flex-shrink-0" />
        )}
      </DropdownMenuItem>
    );
  };

  const groupLabelClass =
    "px-[10px] pt-2 pb-1.5 text-[10.5px] text-[var(--ink-mute)] uppercase tracking-[0.08em] font-semibold";

  return (
    <div className={cn(collapsed ? "px-[10px] py-[14px]" : "px-3 py-[14px]")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isSwitching}
            className={cn(
              "group w-full flex items-center gap-2.5 border border-[var(--line)] rounded-[10px] cursor-pointer font-[inherit] bg-[var(--surface)] transition-colors hover:bg-[var(--surface-2)] data-open:bg-[var(--surface-2)]",
              collapsed ? "justify-center p-1.5" : "justify-start px-[10px] py-2",
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
                    <span>{current.category}</span>
                    <span>·</span>
                    <span>{current.role}</span>
                  </div>
                </div>
                <ChevronDown
                  size={13}
                  className="text-[var(--ink-mute)] transition-transform duration-200 group-data-open:rotate-180"
                />
              </>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side={collapsed ? "right" : "bottom"}
          sideOffset={collapsed ? 8 : 6}
          className={cn(
            "p-1.5 bg-[var(--surface)]",
            collapsed && "w-70",
          )}
        >
          {ownedGroup.length > 0 && (
            <>
              <DropdownMenuLabel className={groupLabelClass}>
                Your workspaces
              </DropdownMenuLabel>
              {ownedGroup.map(renderWorkspaceRow)}
            </>
          )}

          {joinedGroup.length > 0 && (
            <>
              {ownedGroup.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className={groupLabelClass}>
                Joined workspaces
              </DropdownMenuLabel>
              {joinedGroup.map(renderWorkspaceRow)}
            </>
          )}

          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => setIsCreateOpen(true)}
                className="gap-2.5 px-[10px] py-2 text-[var(--accent)] text-[13px] font-medium"
              >
                <span className="w-[30px] h-[30px] rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-dashed border-[var(--accent)]">
                  <Plus size={14} />
                </span>
                Create new workspace
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isCreateOpen && (
        <CreateWorkspaceDialog onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
