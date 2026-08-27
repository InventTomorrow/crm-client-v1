"use client";
import { Checkbox } from "@/shared/ui/Checkbox";
import { FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Label } from "@/shared/ui/Label";
import { Check } from "lucide-react";
import {
  CONDITIONAL_INTAKE_FIELDS,
  CORE_INTAKE_FIELDS,
  type ClinicalServiceFormSectionProps,
} from "../../types";

/**
 * Which questions the assistant asks a family about this service.
 *
 * The seven core questions are asked on every clinical enquiry and are shown
 * read-only: a clinic that could switch off "what is the patient's condition"
 * would be able to configure its way into taking a case blind. Everything here
 * is opt-in on top of those.
 */
export function ClinicalServiceIntakeFields({
  form,
  isSaving,
}: Readonly<ClinicalServiceFormSectionProps>) {
  return (
    <>
      <div className="space-y-2">
        <Label>Always asked</Label>
        <p className="text-muted-foreground text-xs">
          Collected on every clinical enquiry, whichever service is matched.
        </p>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {CORE_INTAKE_FIELDS.map((field) => (
            <li
              key={field.key}
              className="text-muted-foreground flex items-start gap-2 text-xs"
            >
              <Check className="mt-0.5 size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{field.question}</span>
            </li>
          ))}
        </ul>
      </div>

      <FormField
        control={form.control}
        name="intakeFieldKeys"
        render={({ field }) => {
          const selected = new Set(field.value ?? []);

          const toggle = (key: string, checked: boolean) => {
            const next = new Set(selected);
            if (checked) next.add(key);
            else next.delete(key);
            // Kept in the declared order so the assistant asks them in a
            // sensible sequence rather than in click order.
            field.onChange(
              CONDITIONAL_INTAKE_FIELDS.filter((option) =>
                next.has(option.key),
              ).map((option) => option.key),
            );
          };

          return (
            <FormItem>
              <Label>Also ask for this service</Label>
              <p className="text-muted-foreground text-xs">
                Only asked once the assistant has matched this service — so a
                consultation enquiry is never interrogated about shift patterns.
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {CONDITIONAL_INTAKE_FIELDS.map((option) => (
                  <label
                    key={option.key}
                    className="hover:bg-muted/50 flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition"
                  >
                    <Checkbox
                      checked={selected.has(option.key)}
                      onCheckedChange={(checked) =>
                        toggle(option.key, checked === true)
                      }
                      disabled={isSaving}
                      className="mt-0.5"
                    />
                    <span className="space-y-0.5">
                      <span className="block text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="text-muted-foreground block text-xs">
                        &ldquo;{option.question}&rdquo;
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </>
  );
}
