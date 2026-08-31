"use client";
import { useIntakeQuestionEditor } from "@/features/intake-questions/hooks/useIntakeQuestionEditor";
import type { IntakeQuestion } from "@/features/intake-questions/types";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Label } from "@/shared/ui/Label";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Switch } from "@/shared/ui/Switch";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ClinicalServiceFormSectionProps } from "../../types";

/**
 * Which questions the assistant asks a family about this service.
 *
 * The questions themselves belong to the workspace, not to this service: a
 * question added here can be ticked on any service, and editing or deleting one
 * changes it everywhere. The tick decides only whether *this* service asks it.
 *
 * A question marked "every enquiry" is asked whichever service is matched, so
 * its tick is fixed on — turning that off is a change to the question, not to
 * this service.
 */
export function ClinicalServiceIntakeFields({
  form,
  isSaving,
}: Readonly<ClinicalServiceFormSectionProps>) {
  const editor = useIntakeQuestionEditor();

  if (editor.isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="intakeFieldKeys"
      render={({ field }) => {
        const askedByThisService = new Set(field.value ?? []);

        /** Kept in pool order so the assistant asks them in a sensible sequence. */
        const setAskedByThisService = (key: string, isAsked: boolean) => {
          const next = new Set(askedByThisService);
          if (isAsked) next.add(key);
          else next.delete(key);
          field.onChange(
            editor.questions
              .filter((question) => next.has(question.key))
              .map((question) => question.key),
          );
        };

        const addQuestion = async () => {
          const created = await editor.submitDraft();
          // A question added while configuring this service is one the clinic
          // wants asked here — ticking it saves an obvious second click.
          if (created && !created.askAlways) {
            setAskedByThisService(created.key, true);
          }
        };

        return (
          <FormItem>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Label>Questions the assistant asks</Label>
                <p className="text-muted-foreground mt-1 text-xs">
                  Tick the ones this service needs.{" "}
                  {editor.alwaysAskedCount > 0 && (
                    <>
                      {editor.alwaysAskedCount} are asked on every enquiry
                      whichever service is matched.{" "}
                    </>
                  )}
                  Questions are shared across every service.
                </p>
              </div>
            </div>

            <ul className="mt-3 flex flex-col gap-2">
              {editor.questions.map((question) => (
                <IntakeQuestionRow
                  key={question.id}
                  question={question}
                  isAsked={
                    question.askAlways || askedByThisService.has(question.key)
                  }
                  onAskedChange={(isAsked) =>
                    setAskedByThisService(question.key, isAsked)
                  }
                  editor={editor}
                  isSaving={isSaving}
                />
              ))}
            </ul>

            {editor.questions.length === 0 && (
              <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
                No intake questions. The assistant will hand every enquiry to a
                coordinator with nothing but a phone number.
              </p>
            )}

            {editor.isAdding ? (
              <div className="mt-3 space-y-3 rounded-lg border p-3">
                <Input
                  autoFocus
                  value={editor.draftText}
                  onChange={(event) => editor.setDraftText(event.target.value)}
                  placeholder="e.g. Is there a ventilator at home?"
                  disabled={editor.isCreating}
                />
                <label className="flex items-center gap-2 text-xs">
                  <Switch
                    checked={editor.draftAsksAlways}
                    onCheckedChange={editor.setDraftAsksAlways}
                    disabled={editor.isCreating}
                  />
                  <span className="text-muted-foreground">
                    Ask on every enquiry, not just this service
                  </span>
                </label>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={editor.cancelAdding}
                    disabled={editor.isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={addQuestion}
                    disabled={editor.isCreating || !editor.draftText.trim()}
                  >
                    Add question
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={editor.startAdding}
                disabled={isSaving}
              >
                <Plus className="size-4" />
                Add question
              </Button>
            )}

            <FormMessage />

            <ConfirmDialog
              open={Boolean(editor.questionPendingDeletion)}
              onClose={() => editor.setQuestionPendingDeletion(null)}
              onConfirm={editor.confirmDeletion}
              loading={editor.isDeleting}
              title="Remove this question?"
              description={deletionWarning(
                editor.questionPendingDeletion,
                editor.servicesAskingPendingDeletion.length,
              )}
              confirmLabel="Remove question"
            />
          </FormItem>
        );
      }}
    />
  );
}

/** Spells out the blast radius: the pool is shared, so a delete is never local. */
function deletionWarning(
  question: IntakeQuestion | null,
  serviceCount: number,
): string {
  if (!question) return "";

  const scope = question.askAlways
    ? "It is currently asked on every enquiry."
    : serviceCount > 0
      ? `${serviceCount} ${serviceCount === 1 ? "service asks" : "services ask"} it.`
      : "No service currently asks it.";

  return `“${question.questionText}” will be removed from every service in this workspace, and the assistant will stop asking it. ${scope} Answers already collected are kept.`;
}

function IntakeQuestionRow({
  question,
  isAsked,
  onAskedChange,
  editor,
  isSaving,
}: Readonly<{
  question: IntakeQuestion;
  isAsked: boolean;
  onAskedChange: (isAsked: boolean) => void;
  editor: ReturnType<typeof useIntakeQuestionEditor>;
  isSaving: boolean;
}>) {
  const isBeingEdited = editor.questionBeingEditedId === question.id;

  if (isBeingEdited) {
    return (
      <li className="flex items-center gap-2 rounded-lg border p-3">
        <Input
          autoFocus
          value={editor.editedText}
          onChange={(event) => editor.setEditedText(event.target.value)}
          disabled={editor.isUpdating}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Save question"
          onClick={editor.submitEdit}
          disabled={editor.isUpdating || !editor.editedText.trim()}
        >
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancel editing"
          onClick={editor.cancelEditing}
          disabled={editor.isUpdating}
        >
          <X className="size-4" />
        </Button>
      </li>
    );
  }

  return (
    <li className="hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-3 transition">
      <Checkbox
        checked={isAsked}
        // An always-asked question is asked here whatever this service says, so
        // an editable tick would be a lie about what the assistant will do.
        disabled={question.askAlways || isSaving}
        onCheckedChange={(checked) => onAskedChange(checked === true)}
        aria-label={`Ask "${question.questionText}" for this service`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm">{question.questionText}</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {question.askAlways && (
            <Badge variant="secondary" className="text-[10px]">
              Every enquiry
            </Badge>
          )}
          {question.isBuiltIn && (
            <Badge variant="outline" className="text-[10px]">
              Recommended
            </Badge>
          )}
        </div>
      </div>

      <label className="flex shrink-0 items-center gap-1.5 text-[11px]">
        <Switch
          checked={question.askAlways}
          onCheckedChange={(askAlways) =>
            editor.setAsksAlways(question, askAlways)
          }
          disabled={isSaving}
          aria-label={`Ask "${question.questionText}" on every enquiry`}
        />
        <span className="text-muted-foreground hidden sm:inline">Always</span>
      </label>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Edit question"
        onClick={() => editor.startEditing(question)}
        disabled={isSaving}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Remove question"
        onClick={() => editor.setQuestionPendingDeletion(question)}
        disabled={isSaving}
      >
        <Trash2 className="text-destructive size-4" />
      </Button>
    </li>
  );
}
