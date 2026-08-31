"use client";
import { AutoCompleteSelect } from "@/shared/ui/AutoCompleteSelect";
import { Button } from "@/shared/ui/Button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Plus, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type { z } from "zod";
import {
  SCORING_OPERATORS,
  SCORING_OPERATOR_LABELS,
  qualificationFormSchema,
  type QualificationFormData,
} from "../types";
import { useQualificationCopy } from "../utils/qualificationCopy";

type QualificationFormInput = z.input<typeof qualificationFormSchema>;

const operatorOptions = SCORING_OPERATORS.map((operator) => ({
  id: operator,
  label: SCORING_OPERATOR_LABELS[operator],
}));

interface ScoringRulesBuilderProps {
  form: UseFormReturn<QualificationFormInput, unknown, QualificationFormData>;
  fieldArray: UseFieldArrayReturn<QualificationFormInput, "scoringRules">;
  disabled?: boolean;
}

export function ScoringRulesBuilder({
  form,
  fieldArray,
  disabled = false,
}: ScoringRulesBuilderProps) {
  const { fields, append, remove } = fieldArray;
  const copy = useQualificationCopy();
  const questions = useWatch({ control: form.control, name: "questions" });

  // Rules point at a question by fieldName, so only named questions can be scored.
  const scorableQuestions = (questions ?? []).filter(
    (question) => question.fieldName,
  );
  // A copied question keeps the same text under a different fieldName — collapse those
  // down to one entry per wording so the dropdown doesn't list indistinguishable rows.
  const seenQuestionLabels = new Set<string>();
  const questionOptions = scorableQuestions
    .filter((question) => {
      if (seenQuestionLabels.has(question.questionText)) return false;
      seenQuestionLabels.add(question.questionText);
      return true;
    })
    .map((question) => ({
      id: question.fieldName,
      label: question.questionText,
    }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            Scoring rules
          </h2>
          <p className="text-xs text-[var(--ink-mute)]">
            {copy.scoringSummary}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={disabled || scorableQuestions.length === 0}
          onClick={() =>
            append({
              fieldName: scorableQuestions[0]?.fieldName ?? "",
              operator: "EQUALS",
              value: "",
              score: 10,
            })
          }
        >
          <Plus size={14} className="mr-1.5" /> Add rule
        </Button>
      </div>

      {scorableQuestions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--ink-mute)]">
          Add a question with a field name first — rules score the answers to
          those questions.
        </p>
      ) : (
        fields.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--ink-mute)]">
            {copy.noScoringRules}
          </p>
        )
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_88px_auto]"
          >
            <FormField
              control={form.control}
              name={`scoringRules.${index}.fieldName`}
              render={({ field: fieldNameField }) => (
                <FormItem>
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <AutoCompleteSelect
                      items={questionOptions}
                      selected={
                        questionOptions.find(
                          (option) => option.id === fieldNameField.value,
                        ) ?? null
                      }
                      onSelect={(item) =>
                        item && fieldNameField.onChange(item.id)
                      }
                      placeholder="Pick a question"
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`scoringRules.${index}.operator`}
              render={({ field: operatorField }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <FormControl>
                    <AutoCompleteSelect
                      items={operatorOptions}
                      selected={
                        operatorOptions.find(
                          (option) => option.id === operatorField.value,
                        ) ?? null
                      }
                      onSelect={(item) =>
                        item && operatorField.onChange(item.id)
                      }
                      placeholder="Pick a condition"
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`scoringRules.${index}.value`}
              render={({ field: valueField }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={copy.scoringValuePlaceholder}
                      disabled={disabled}
                      {...valueField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`scoringRules.${index}.score`}
              render={({ field: scoreField }) => (
                <FormItem>
                  <FormLabel>Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={disabled}
                      {...scoreField}
                      onChange={(e) =>
                        scoreField.onChange(Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Delete rule"
              className="mt-7 shrink-0 text-[var(--ink-mute)] hover:text-destructive"
              disabled={disabled}
              onClick={() => remove(index)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
