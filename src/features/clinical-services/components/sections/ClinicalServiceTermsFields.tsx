"use client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import type { ClinicalServiceFormSectionProps } from "../../types";

/** The four numeric terms, paired two to a row so the section stays on one grid. */
const NUMERIC_FIELDS = [
  {
    name: "durationMinutes",
    label: "Appointment length (min)",
    placeholder: "45",
  },
  {
    name: "minServicePeriodDays",
    label: "Minimum period (days)",
    placeholder: "15",
  },
  {
    name: "terminationNoticeDays",
    label: "Notice period (days)",
    placeholder: "15",
  },
  {
    name: "advancePaymentPercent",
    label: "Advance payment (%)",
    placeholder: "100",
  },
] as const;

export function ClinicalServiceTermsFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        {NUMERIC_FIELDS.map((numericField) => (
          <FormField
            key={numericField.name}
            control={form.control}
            name={numericField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{numericField.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder={numericField.placeholder}
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>

      {/* Full width: it is a sentence, not a figure. */}
      <FormField
        control={form.control}
        name="advancePaymentNote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Advance payment note</FormLabel>
            <FormControl>
              <Input
                placeholder="Full amount payable in advance."
                disabled={isSaving}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
