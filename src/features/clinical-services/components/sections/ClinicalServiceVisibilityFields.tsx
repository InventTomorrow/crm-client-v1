"use client";
import { FormControl, FormField, FormItem } from "@/shared/ui/form";
import { Label } from "@/shared/ui/Label";
import { Switch } from "@/shared/ui/Switch";
import type { ClinicalServiceFormSectionProps } from "../../types";

const TOGGLES = [
  {
    name: "isPubliclyListed",
    label: "Show in the assistant's menu",
    hint: 'Off means "available on enquiry" — never volunteered, but still found when a family names it directly.',
  },
  {
    name: "requiresPractitioner",
    label: "Needs a named practitioner",
    hint: "Appointments for this service are booked against a specific person.",
  },
  {
    name: "isActive",
    label: "Active",
    hint: "Inactive services are never offered or searched.",
  },
] as const;

export function ClinicalServiceVisibilityFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  return (
    <>
      {TOGGLES.map((toggle) => (
        <FormField
          key={toggle.name}
          control={form.control}
          name={toggle.name}
          // `flex-row` is explicit: FormItem is flex-col, and tailwind-merge
          // only drops a conflicting display, not the direction.
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={toggle.name}>{toggle.label}</Label>
                <p className="text-muted-foreground text-sm">{toggle.hint}</p>
              </div>
              <FormControl>
                <Switch
                  id={toggle.name}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
