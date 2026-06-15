"use client";
import { AuthFormError } from "@/features/auth/components/AuthFormError";
import { useCreateWorkspace } from "@/features/auth/hooks/useAuth";
import { createWorkspaceSchema, type CreateWorkspaceData } from "@/features/auth/types";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { OnboardingShell } from "./OnboardingShell";

export function WorkspaceView() {
  const { mutate, isPending, error } = useCreateWorkspace();

  const form = useForm<CreateWorkspaceData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  return (
    <OnboardingShell currentStep="WORKSPACE">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">
          Create your workspace
        </h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">
          Name your business — this is how it appears across the app.
        </p>
      </div>

      <div className="card p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((d) => mutate(d))}
            className="flex flex-col gap-4"
          >
            <AuthFormError error={error} />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12.5px] font-medium text-[var(--ink-soft)]">
                    Workspace / business name
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2
                        size={13}
                        className="absolute left-[11px] top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
                      />
                      <Input
                        className="input pl-8 h-10"
                        placeholder="e.g. Karachi Karahi Co."
                        autoFocus
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              variant="default"
              className="btn btn-grad w-full justify-center mt-1"
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
