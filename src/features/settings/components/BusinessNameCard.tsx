"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { useUpdateBusinessName } from "@/features/tenant/hooks/useTenant";
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
import { Check, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { businessIdentitySchema, type BusinessIdentityForm } from "../types";

/** Editable customer-facing business name, next to the fixed workspace name. */
export function BusinessNameCard() {
  const { tenant } = useCurrentTenant();
  const { mutate: saveBusinessName, isPending } = useUpdateBusinessName();

  const form = useForm<BusinessIdentityForm>({
    resolver: zodResolver(businessIdentitySchema),
    defaultValues: { businessName: "" },
  });

  // Workspaces created before the name split have no business name yet — the
  // workspace name is what they trade under until the owner changes it.
  useEffect(() => {
    if (!tenant) return;
    form.reset({ businessName: tenant.businessName ?? tenant.name });
  }, [tenant, form]);

  return (
    <div className="card p-[22px] flex flex-col gap-3">
      <div>
        <h4 className="text-[13.5px] font-semibold">Business name</h4>
        <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
          What customers see — AI replies, order receipts and checkout. Your
          workspace name stays the same.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            saveBusinessName(values.businessName, {
              onSuccess: () => form.reset(values),
            }),
          )}
          className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:items-start"
        >
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Karachi Karahi"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-1.5">
            <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">
              Workspace name
            </FormLabel>
            <Input value={tenant?.name ?? ""} readOnly disabled />
            <p className="text-[11px] text-[var(--ink-mute)]">
              Fixed when the workspace was created.
            </p>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              disabled={isPending || !form.formState.isDirty}
            >
              {isPending ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check size={14} /> Save name
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
