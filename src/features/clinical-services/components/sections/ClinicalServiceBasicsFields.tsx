"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { NativeSelect } from "@/shared/ui/NativeSelect";
import { Textarea } from "@/shared/ui/Textarea";
import {
  CLINICAL_SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  type ClinicalServiceFormSectionProps,
} from "../../types";
import { FieldHint } from "@/shared/ui/FieldHint";
import { ClinicalCategoryAutocomplete } from "../ClinicalCategoryAutocomplete";

export function ClinicalServiceBasicsFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Home Nursing"
                  disabled={isSaving}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <NativeSelect size="lg" disabled={isSaving} {...field}>
                  {CLINICAL_SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {SERVICE_TYPE_LABELS[type]}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <ClinicalCategoryAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
              <FormDescription>
                Groups related services together. Optional.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                Escalation queue
                <FieldHint label="the escalation queue">
                  When the assistant hands a conversation about this service to
                  a person, this is the team it alerts — type the queue&apos;s
                  key, e.g. <code>clinical</code>. Leave it blank and hand-offs
                  go to the workspace&apos;s default queue.
                </FieldHint>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="clinical"
                  disabled={isSaving}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="shortDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Short description</FormLabel>
            <FormControl>
              <Input
                placeholder="Qualified nurses deployed to the patient's home."
                disabled={isSaving}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fullDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full description</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
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
