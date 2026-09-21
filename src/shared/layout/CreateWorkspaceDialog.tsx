"use client";
import { VerticalCard } from "@/features/onboarding/components/VerticalCard";
import { useCreateWorkspaceForm } from "@/features/tenant/hooks/useCreateWorkspaceForm";
import { BUSINESS_VERTICALS } from "@/lib/business-verticals";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Building2, Check, Crown, Loader2, Plus } from "lucide-react";
import Link from "next/link";

function RequiredMark() {
  return <span className="text-destructive">*</span>;
}

/** Create-workspace flow shared by the sidebar switchers and Settings → Workspaces. */
export function CreateWorkspaceDialog({ onClose }: { onClose: () => void }) {
  const {
    form,
    handleCreateWorkspace,
    isPending,
    isWorkspaceLimitReached,
    workspaceAllowance,
    ownedWorkspaces,
  } = useCreateWorkspaceForm(onClose);

  return (
    <Dialog
      open
      onOpenChange={(isOpen) => {
        if (!isOpen && !isPending) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[580px]"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b border-line px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
              <Building2 size={18} className="text-accent" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-[16px] font-semibold">
                New workspace
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-[12px] text-ink-mute">
                Isolated data, members, and billing.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleCreateWorkspace}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <div className="scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {isWorkspaceLimitReached && (
                <FormField
                  control={form.control}
                  name="replaceTenantId"
                  render={({ field }) => (
                    <FormItem className="gap-2.5 rounded-xl border border-warning/30 bg-warning-soft px-3.5 py-3">
                      <div className="flex items-start gap-2.5">
                        <Crown size={15} className="mt-0.5 shrink-0 text-warning-foreground" />
                        <p className="text-[12px] leading-relaxed text-ink-soft">
                          Your plan includes {workspaceAllowance?.limit} workspace
                          {workspaceAllowance?.limit === 1 ? "" : "s"} and you&apos;re
                          already using {workspaceAllowance?.used}.{" "}
                          <Link
                            href="/settings/billing"
                            className="font-medium text-accent"
                            onClick={onClose}
                          >
                            Upgrade your plan
                          </Link>{" "}
                          or pick one to replace — it&apos;s scheduled for deletion
                          and restorable for 60 days.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                        {ownedWorkspaces.map((workspace) => {
                          const isSelected = field.value === workspace.id;
                          return (
                            <button
                              key={workspace.id}
                              type="button"
                              aria-pressed={isSelected}
                              disabled={isPending}
                              onClick={() => field.onChange(isSelected ? undefined : workspace.id)}
                              className={cn(
                                "flex items-center justify-between rounded-lg border bg-surface px-3 py-2 text-left text-[12.5px] font-medium transition-colors",
                                isSelected
                                  ? "border-accent text-ink"
                                  : "border-line text-ink-soft hover:border-ink-mute",
                              )}
                            >
                              <span className="truncate">{workspace.name}</span>
                              {isSelected && <Check size={14} className="shrink-0 text-accent" />}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Workspace name <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Karachi Branch"
                          autoFocus
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Internal label — can&apos;t be changed later.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Business name <RequiredMark />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Karachi Karahi" disabled={isPending} {...field} />
                      </FormControl>
                      <FormDescription>What customers see — editable later.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessVertical"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business type <RequiredMark />
                    </FormLabel>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {BUSINESS_VERTICALS.map((vertical, index) => (
                        <VerticalCard
                          key={vertical.value}
                          variant="compact"
                          icon={vertical.icon}
                          title={vertical.title}
                          description={vertical.description}
                          selected={field.value === vertical.value}
                          disabled={isPending}
                          index={index}
                          onSelect={() => field.onChange(vertical.value)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-start gap-2.5 rounded-xl bg-surface-2 px-3.5 py-3">
                <Crown size={14} className="mt-0.5 shrink-0 text-accent" />
                <p className="text-[12px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">You&apos;ll be the Owner.</span>{" "}
                  Invite your team after creation — data stays isolated from your
                  other workspaces.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-line px-6 py-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Creating…
                  </>
                ) : (
                  <>
                    <Plus size={13} />
                    {isWorkspaceLimitReached ? "Replace & create" : "Create workspace"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
