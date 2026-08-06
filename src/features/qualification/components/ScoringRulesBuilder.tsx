'use client';
import { Button } from '@/shared/ui/Button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import { Plus, Trash2 } from 'lucide-react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { z } from 'zod';
import {
  SCORING_OPERATORS,
  SCORING_OPERATOR_LABELS,
  qualificationFormSchema,
  type QualificationFormData,
} from '../types';

type QualificationFormInput = z.input<typeof qualificationFormSchema>;

interface ScoringRulesBuilderProps {
  form: UseFormReturn<QualificationFormInput, unknown, QualificationFormData>;
  fieldArray: UseFieldArrayReturn<QualificationFormInput, 'scoringRules'>;
  disabled?: boolean;
}

export function ScoringRulesBuilder({
  form,
  fieldArray,
  disabled = false,
}: ScoringRulesBuilderProps) {
  const { fields, append, remove } = fieldArray;
  const questions = useWatch({ control: form.control, name: 'questions' });

  // Rules point at a question by fieldName, so only named questions can be scored.
  const scorableQuestions = (questions ?? []).filter((question) => question.fieldName);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Scoring rules</h2>
          <p className="text-xs text-[var(--ink-mute)]">
            Each matching rule adds its score. The total decides the lead&apos;s temperature.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={disabled || scorableQuestions.length === 0}
          onClick={() =>
            append({
              fieldName: scorableQuestions[0]?.fieldName ?? '',
              operator: 'EQUALS',
              value: '',
              score: 10,
            })
          }
        >
          <Plus size={14} className="mr-1.5" /> Add rule
        </Button>
      </div>

      {scorableQuestions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--ink-mute)]">
          Add a question with a field name first — rules score the answers to those questions.
        </p>
      ) : (
        fields.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-xs text-[var(--ink-mute)]">
            No rules yet. Without them every lead scores zero and lands as cold.
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
                    <NativeSelect size="lg" disabled={disabled} {...fieldNameField}>
                      {scorableQuestions.map((question) => (
                        <option key={question.fieldName} value={question.fieldName}>
                          {question.fieldName}
                        </option>
                      ))}
                    </NativeSelect>
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
                    <NativeSelect size="lg" disabled={disabled} {...operatorField}>
                      {SCORING_OPERATORS.map((operator) => (
                        <option key={operator} value={operator}>
                          {SCORING_OPERATOR_LABELS[operator]}
                        </option>
                      ))}
                    </NativeSelect>
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
                      placeholder="e.g. 100000"
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
                      onChange={(e) => scoreField.onChange(Number(e.target.value))}
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
