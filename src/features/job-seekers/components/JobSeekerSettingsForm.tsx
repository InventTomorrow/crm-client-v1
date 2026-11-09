"use client";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { SettingsSaveBar } from "@/features/settings/components/SettingsSaveBar";
import { Button } from "@/shared/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { InstructionListField } from "@/shared/ui/InstructionListField";
import { Label } from "@/shared/ui/Label";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Switch } from "@/shared/ui/Switch";
import { useJobSeekerConfigForm } from "../hooks/useJobSeekerConfigForm";
import {
  MAX_JOB_SEEKER_FIELDS,
  MAX_JOB_SEEKER_INSTRUCTIONS,
  MAX_JOB_SEEKER_INSTRUCTION_LENGTH,
} from "../types";

/** What the assistant may ask someone looking for a job, and how it behaves once it has the answers. */
export function JobSeekerSettingsForm() {
  const {
    form,
    fieldRows,
    isLoading,
    isSaving,
    isDirty,
    submit,
    discardChanges,
    addField,
  } = useJobSeekerConfigForm();

  if (isLoading) {
    return (
      <div className="grid gap-4 lg:grid-cols-2" aria-busy="true">
        <Skeleton className="h-72 w-full rounded-none" />
        <Skeleton className="h-72 w-full rounded-none" />
      </div>
    );
  }

  const fieldsError = form.formState.errors.fields;

  return (
    <Form {...form}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="grid items-start gap-4 lg:grid-cols-2">
          <section className="card flex flex-col gap-3 rounded-none p-4">
            <div className="border-l-2 border-[var(--accent)] pl-3">
              <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                Details to collect
              </h3>
              <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--ink-mute)]">
                The assistant asks for these and nothing else. Leave the list
                empty to collect nothing.
              </p>
            </div>

            {fieldRows.fields.length === 0 ? (
              <p className="border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-3 py-3 text-center text-[11px] text-[var(--ink-mute)]">
                No details yet. The assistant will only point applicants to your
                HR contact.
              </p>
            ) : (
              <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
                {fieldRows.fields.map((row, index) => (
                  <li key={row.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Input
                        className="flex-1"
                        placeholder="e.g. Years of experience"
                        maxLength={80}
                        aria-label={`Detail ${index + 1}`}
                        disabled={isSaving}
                        {...form.register(`fields.${index}.label`)}
                      />
                      <FormField
                        control={form.control}
                        name={`fields.${index}.isRequired`}
                        render={({ field }) => (
                          <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-[var(--ink-soft)]">
                            <Switch
                              size="sm"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSaving}
                            />
                            Required
                          </label>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove detail ${index + 1}`}
                        className="shrink-0 text-[var(--ink-mute)] hover:text-destructive"
                        disabled={isSaving}
                        onClick={() => fieldRows.remove(index)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                    {fieldsError?.[index]?.label?.message && (
                      <p className="text-[11px] text-destructive">
                        {fieldsError[index].label.message}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {(fieldsError?.root?.message ?? fieldsError?.message) && (
              <p className="text-[11px] text-destructive">
                {fieldsError?.root?.message ?? fieldsError?.message}
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="self-start"
              disabled={
                isSaving || fieldRows.fields.length >= MAX_JOB_SEEKER_FIELDS
              }
              onClick={addField}
            >
              <Plus size={13} className="mr-1.5" />
              Add detail
            </Button>

            <FormField
              control={form.control}
              name="requestCv"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-4 border border-[var(--line)] p-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="request-cv">Ask for a CV</Label>
                    <p className="text-[11.5px] text-[var(--ink-mute)]">
                      The assistant asks for a PDF CV. Whatever they send is
                      saved on their record here.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      id="request-cv"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </section>

          <section className="card flex flex-col gap-3 rounded-none p-4">
            <div className="border-l-2 border-[var(--accent)] pl-3">
              <h3 className="text-[14px] font-semibold text-[var(--ink)]">
                After getting the details
              </h3>
              <p className="mt-0.5 text-[11.5px] leading-snug text-[var(--ink-mute)]">
                How the assistant behaves once it has them, e.g. that you are
                not hiring right now, or that you will consider them first when
                you do. It never promises a job, interview, salary or callback
                beyond what you write here.
              </p>
            </div>
            <FormField
              control={form.control}
              name="afterDetailsInstructions"
              render={({ field }) => (
                <FormItem>
                  <InstructionListField
                    label="Instructions"
                    placeholder="e.g. We are not hiring at the moment. Thank them for the details and say we will consider them first when we start hiring."
                    addLabel="Add instruction"
                    emptyHint="No instructions yet. The assistant says only that the team reviews every application."
                    maxItems={MAX_JOB_SEEKER_INSTRUCTIONS}
                    maxLength={MAX_JOB_SEEKER_INSTRUCTION_LENGTH}
                    values={field.value}
                    onChange={field.onChange}
                    disabled={isSaving}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>
        </div>

        <SettingsSaveBar>
          <Button
            type="button"
            variant="outline"
            disabled={!isDirty || isSaving}
            onClick={discardChanges}
          >
            Discard
          </Button>
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={14} /> Save settings
              </>
            )}
          </Button>
        </SettingsSaveBar>
      </form>
    </Form>
  );
}
