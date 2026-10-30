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
import { InstructionListField } from "@/shared/ui/InstructionListField";
import { Label } from "@/shared/ui/Label";
import { Switch } from "@/shared/ui/Switch";
import { useWatch } from "react-hook-form";
import type { ClinicalServiceFormSectionProps } from "../../types";

export function ClinicalServiceInstructionsFields({
  form,
  isSaving,
}: ClinicalServiceFormSectionProps) {
  const isEscalationEnabled =
    useWatch({ control: form.control, name: "escalation.isEnabled" }) ?? true;

  return (
    <>
      <FormField
        control={form.control}
        name="chatbotInstructions"
        render={({ field }) => (
          <FormItem>
            <InstructionListField
              label="Instructions for this service"
              placeholder="e.g. Always ask whether the patient has been seen here before. For dialysis, hand over to the team after collecting the patient's details."
              addLabel="Add instruction"
              emptyHint="No instructions yet. The assistant follows its general rules for this service."
              maxItems={10}
              maxLength={400}
              isLabelProminent
              isAddButtonCentered
              values={field.value ?? []}
              onChange={field.onChange}
              disabled={isSaving}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-5">
        <FormField
          control={form.control}
          name="escalation.isEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="escalation-enabled">
                  Escalate to your team for this service
                </Label>
                <p className="text-muted-foreground text-sm">
                  Off means the assistant handles it itself. It still hands
                  over for emergencies or when the patient asks for a person.
                </p>
              </div>
              <FormControl>
                <Switch
                  id="escalation-enabled"
                  checked={field.value ?? true}
                  onCheckedChange={field.onChange}
                  disabled={isSaving}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isEscalationEnabled && (
          <>
            <FormField
              control={form.control}
              name="escalation.whenToEscalate"
              render={({ field }) => (
                <FormItem>
                  <InstructionListField
                    label="When to escalate"
                    placeholder="e.g. The patient mentions bleeding, or asks for a discount or a specific doctor."
                    addLabel="Add condition"
                    emptyHint="No conditions yet. The assistant uses its general escalation rules."
                    maxItems={5}
                    maxLength={300}
                    isLabelProminent
                    isAddButtonCentered
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
              name="escalation.notifyNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation WhatsApp number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="0300 1234 567"
                      disabled={isSaving}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Alerted instead of your default support contact when this
                    service is escalated. Leave empty to use the default.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>
    </>
  );
}
