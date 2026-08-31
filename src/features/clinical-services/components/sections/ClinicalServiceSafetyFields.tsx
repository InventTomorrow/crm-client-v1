"use client";
import { EditableListField } from "@/shared/ui/EditableListField";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/Textarea";
import type { ClinicalServiceFormSectionProps } from "../../types";

export function ClinicalServiceSafetyFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="requiredStaffQualifications"
        render={({ field }) => (
          <FormItem>
            <EditableListField
              label="Required staff qualifications"
              placeholder="MBBS, FCPS (Cardiology)"
              addLabel="Add qualification"
              emptyHint="The assistant will never propose a less-qualified alternative for this service."
              values={field.value ?? []}
              onChange={field.onChange}
              disabled={isSaving}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="safetyNote"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Safety note</FormLabel>
            <FormControl>
              <Textarea
                rows={3}
                placeholder="Patients on blood thinners must be reviewed by the consultant before this procedure."
                disabled={isSaving}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              Surfaced to the assistant verbatim whenever this service is
              discussed.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
