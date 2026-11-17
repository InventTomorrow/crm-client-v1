"use client";
import { AuthFormError } from "@/features/auth/components/AuthFormError";
import { ReferralCodeField } from "@/features/referrals/components/ReferralCodeField";
import { useCaptureReferralCode } from "@/features/referrals/hooks/useCaptureReferralCode";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Building2, Loader2, Store } from "lucide-react";
import { useWorkspaceForm } from "../hooks/useWorkspaceForm";
import { OnboardingShell } from "./OnboardingShell";

export function WorkspaceView() {
  useCaptureReferralCode();
  const {
    form,
    submitWorkspace,
    isPending,
    error,
    referralCheck,
    isReferralFieldOpen,
    openReferralField,
  } = useWorkspaceForm();

  return (
    <OnboardingShell currentStep="WORKSPACE">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">
          Create your workspace
        </h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
          Name the workspace your team works in, and the business your customers
          see.
        </p>
      </div>

      <div className="card p-6">
        <Form {...form}>
          <form onSubmit={submitWorkspace} className="flex flex-col gap-4">
            <AuthFormError error={error} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Workspace name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="pl-8 h-10"
                        placeholder="e.g. Evyln Enterprises"
                        autoFocus
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-[var(--ink-mute)]">
                    Internal label for your team. This can&apos;t be changed
                    later.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Business name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Store
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="pl-8 h-10"
                        placeholder="e.g. Evyln Enterprises"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <p className="text-[11px] text-[var(--ink-mute)]">
                    What customers see in chats and receipts. You can change it
                    any time.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ReferralCodeField
              control={form.control}
              name="referralCode"
              checkState={referralCheck}
              isOpen={isReferralFieldOpen}
              onOpen={openReferralField}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full justify-center mt-1"
              disabled={isPending}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              {isPending ? "Creating workspace…" : "Continue"}
            </Button>
          </form>
        </Form>
      </div>
    </OnboardingShell>
  );
}
