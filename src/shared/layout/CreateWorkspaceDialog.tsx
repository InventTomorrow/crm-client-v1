"use client";
import { useWorkspaceAllowance } from "@/features/billing/hooks/useBilling";
import { VerticalCard } from "@/features/onboarding/components/VerticalCard";
import { useCreateTenant } from "@/features/tenant/hooks/useTenant";
import {
  BUSINESS_VERTICALS,
  type BusinessVertical,
} from "@/lib/business-verticals";
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
import { Crown, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

/** Inline create-workspace flow shared by both sidebar workspace switchers. */
export function CreateWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [businessVertical, setBusinessVertical] =
    useState<BusinessVertical | null>(null);
  const { mutate: createTenant, isPending } = useCreateTenant();
  // Mirrors the server-side cap on POST /tenants so the limit is visible
  // before submitting, not as a 403 after.
  const { data: workspaceAllowance } = useWorkspaceAllowance();
  const workspaceLimitReached = workspaceAllowance?.canCreate === false;

  const canCreate =
    !!name.trim() && !!businessVertical && !workspaceLimitReached;

  const handleCreate = () => {
    if (!canCreate || !businessVertical) return;
    createTenant(
      { name: name.trim(), businessVertical },
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
            <div className="flex items-start gap-2.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
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
                to add more.
              </p>
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
          </div>

          <div>
            <Label className="block text-[12px] font-medium text-[var(--ink-soft)] mb-1.5">
              Business type
            </Label>
            <div className="flex flex-col gap-2">
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
