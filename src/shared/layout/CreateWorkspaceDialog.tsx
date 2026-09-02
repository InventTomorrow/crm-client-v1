"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { useWorkspaceAllowance } from "@/features/billing/hooks/useBilling";
import { VerticalCard } from "@/features/onboarding/components/VerticalCard";
import { useCreateTenant } from "@/features/tenant/hooks/useTenant";
import {
  BUSINESS_VERTICALS,
  type BusinessVertical,
} from "@/lib/business-verticals";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";
import { Check, Crown, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type OwnedWorkspace = { id: string; name: string };

/** Inline create-workspace flow shared by both sidebar workspace switchers. */
export function CreateWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessVertical, setBusinessVertical] =
    useState<BusinessVertical | null>(null);
  // At the cap the owner picks which current workspace gives up its slot.
  const [replaceTenantId, setReplaceTenantId] = useState<string | null>(null);
  const { mutate: createTenant, isPending } = useCreateTenant();
  const { user } = useMe();
  const { data: workspaceAllowance } = useWorkspaceAllowance();
  const workspaceLimitReached = workspaceAllowance?.canCreate === false;

  const ownedWorkspaces: OwnedWorkspace[] = (user?.memberships ?? [])
    .filter(
      (membership: { role: { name: string } }) =>
        membership.role.name === "OWNER",
    )
    .map((membership: { tenant: { id: string; name: string } }) => ({
      id: membership.tenant.id,
      name: membership.tenant.name,
    }));

  const canCreate =
    name.trim().length >= 2 &&
    businessName.trim().length >= 2 &&
    !!businessVertical &&
    (!workspaceLimitReached || !!replaceTenantId);

  const handleCreate = () => {
    if (!canCreate || !businessVertical) return;
    createTenant(
      {
        name: name.trim(),
        businessName: businessName.trim(),
        businessVertical,
        ...(workspaceLimitReached && replaceTenantId
          ? { replaceTenantId }
          : {}),
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent
        className="flex flex-col gap-0 p-0 sm:max-w-[480px] overflow-hidden"
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
          {workspaceLimitReached && (
            <div className="flex flex-col gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
              <div className="flex items-start gap-2.5">
                <Crown
                  size={15}
                  className="mt-0.5 flex-shrink-0 text-[var(--ink-mute)]"
                />
                <p className="text-[12px] leading-relaxed text-[var(--ink-soft)]">
                  Your plan includes {workspaceAllowance?.limit} workspace
                  {workspaceAllowance?.limit === 1 ? "" : "s"} and you&apos;re
                  already using {workspaceAllowance?.used}.{" "}
                  <Link
                    href="/settings/billing"
                    className="font-medium text-[var(--accent)]"
                    onClick={onClose}
                  >
                    Upgrade your plan
                  </Link>{" "}
                  to add more — or pick a workspace below to replace. It will be
                  scheduled for deletion and stays restorable for 60 days.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ownedWorkspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setReplaceTenantId((currentId) =>
                        currentId === workspace.id ? null : workspace.id,
                      )
                    }
                    className={cn(
                      "flex items-center justify-between rounded-[8px] border px-3 py-2 text-left text-[12.5px] font-medium transition-colors",
                      replaceTenantId === workspace.id
                        ? "border-[var(--accent)] text-[var(--ink)]"
                        : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-mute)]",
                    )}
                  >
                    {workspace.name}
                    {replaceTenantId === workspace.id && (
                      <Check size={14} className="text-[var(--accent)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <Label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Workspace name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Karachi Karahi Co."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              disabled={isPending}
            />
            <p className="mt-1 text-[11px] text-[var(--ink-mute)]">
              Internal label your team switches between. This can&apos;t be
              changed later.
            </p>
          </div>

          <div>
            <Label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Business name
            </Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Karachi Karahi"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              disabled={isPending}
            />
            <p className="mt-1 text-[11px] text-[var(--ink-mute)]">
              What customers see — chats, receipts and checkout. Editable any
              time from Business settings.
            </p>
          </div>

          <div>
            <Label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Business type
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {BUSINESS_VERTICALS.map((vertical, index) => (
                <VerticalCard
                  key={vertical.value}
                  icon={vertical.icon}
                  title={vertical.title}
                  description={vertical.description}
                  selected={businessVertical === vertical.value}
                  disabled={isPending}
                  index={index}
                  onSelect={() => setBusinessVertical(vertical.value)}
                />
              ))}
            </div>
          </div>

          <p className="text-[11.5px] text-[var(--ink-mute)] leading-relaxed">
            You&apos;ll be the <strong>Owner</strong> of this workspace. Team
            members can be invited after setup.
          </p>
        </div>

        <div className="px-[14px] py-[14px] border-t border-[var(--line)] flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isPending}>
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Creating…
              </>
            ) : workspaceLimitReached && replaceTenantId ? (
              <>
                <Plus size={13} /> Replace &amp; create
              </>
            ) : (
              <>
                <Plus size={13} /> Create workspace
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
