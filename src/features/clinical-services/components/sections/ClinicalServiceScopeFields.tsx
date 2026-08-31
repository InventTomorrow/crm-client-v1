"use client";
import { EditableListField } from "@/shared/ui/EditableListField";
import { FormField, FormItem, FormMessage } from "@/shared/ui/form";
import type { ClinicalServiceFormSectionProps } from "../../types";

/**
 * The scope boundary. These two lists are the entire basis for every scope
 * answer the assistant gives, which is what stops it promising a procedure the
 * clinic does not perform under this service.
 */
export function ClinicalServiceScopeFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="includedActivities"
        render={({ field }) => (
          <FormItem>
            <EditableListField
              label="This service includes"
              placeholder="Consultation and physical examination"
              addLabel="Add activity"
              emptyHint="What the clinic actually does under this service."
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
        name="excludedActivities"
        render={({ field }) => (
          <FormItem>
            <EditableListField
              label="This service does NOT include"
              placeholder="Lab tests and imaging"
              addLabel="Add exclusion"
              emptyHint="The assistant will refuse these however the patient phrases the request."
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
        name="conditionsTreated"
        render={({ field }) => (
          <FormItem>
            <EditableListField
              label="Conditions treated"
              placeholder="Hypertension"
              addLabel="Add condition"
              emptyHint="Helps the assistant match a described symptom to this service."
              values={field.value ?? []}
              onChange={field.onChange}
              disabled={isSaving}
            />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
