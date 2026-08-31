"use client";
import { EditableListField } from "@/shared/ui/EditableListField";
import { FormField, FormItem, FormMessage } from "@/shared/ui/form";
import type { ClinicalServiceFormSectionProps } from "../../types";

/**
 * The scope boundary. These two lists are the entire basis for every scope
 * answer the assistant gives, which is what stops it promising a medical
 * procedure from a non-medical carer.
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
              placeholder="Bathing and grooming"
              addLabel="Add activity"
              emptyHint="What staff will do under this service."
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
              placeholder="Household laundry"
              addLabel="Add exclusion"
              emptyHint="The assistant will refuse these however the family phrases the request."
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
              placeholder="Post-stroke recovery"
              addLabel="Add condition"
              emptyHint="Helps the assistant match a described situation to this service."
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
