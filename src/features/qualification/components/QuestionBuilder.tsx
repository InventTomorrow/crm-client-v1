'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { EditableListField } from '@/shared/ui/EditableListField';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import { Switch } from '@/shared/ui/Switch';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { z } from 'zod';
import {
  LEAD_FIELD_MAPPINGS,
  QUESTION_INPUT_TYPES,
  QUESTION_INPUT_TYPE_LABELS,
  qualificationFormSchema,
  type QualificationFormData,
} from '../types';
import { deriveUniqueFieldName } from '../utils/fieldName';

type QualificationFormInput = z.input<typeof qualificationFormSchema>;

/** Three question cards plus the gaps between them. Past the third the list scrolls inside the
 * section rather than pushing the save bar further down the page — capped against the viewport
 * so the inner scroller can never itself be taller than the screen. */
const VISIBLE_QUESTIONS_HEIGHT = 'max-h-[min(51rem,60vh)]';

interface QuestionBuilderProps {
  form: UseFormReturn<QualificationFormInput, unknown, QualificationFormData>;
  fieldArray: UseFieldArrayReturn<QualificationFormInput, 'questions'>;
  /** Field names already persisted — these are live storage keys and are never auto-rewritten. */
  savedFieldNames: Set<string>;
  disabled?: boolean;
}

function buildEmptyQuestion(order: number): QualificationFormInput['questions'][number] {
  return {
    order,
    fieldName: '',
    questionText: '',
    inputType: 'FREE_TEXT',
    options: [],
    isRequired: true,
    mapsToLeadField: null,
  };
}

export function QuestionBuilder({
  form,
  fieldArray,
  savedFieldNames,
  disabled = false,
}: QuestionBuilderProps) {
  const { fields, append, remove, swap } = fieldArray;
  const questions = useWatch({ control: form.control, name: 'questions' });
  const listRef = useRef<HTMLDivElement>(null);

  // Past the third question the new card is appended below the fold, so follow it down —
  // otherwise Add question reads as having done nothing.
  function handleAddQuestion() {
    append(buildEmptyQuestion(fields.length));
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    });
  }

  /**
   * Keeps an unsaved question's storage key following its text. A saved key is left
   * alone — answers and scoring rules already reference it, so rewriting it would
   * orphan them. Keys in use elsewhere in the form are passed in so a duplicate
   * question gets a numbered key instead of an error nobody can act on.
   */
  function handleQuestionTextChange(index: number, nextText: string) {
    const currentFieldName = form.getValues(`questions.${index}.fieldName`) ?? '';
    if (savedFieldNames.has(currentFieldName)) return;

    const keysInUse = (form.getValues('questions') ?? [])
      .map((question, questionIndex) => (questionIndex === index ? '' : question.fieldName))
      .filter(Boolean);

    form.setValue(
      `questions.${index}.fieldName`,
      deriveUniqueFieldName(nextText, index, keysInUse),
      { shouldValidate: true, shouldDirty: true },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[var(--ink)]">Questions</h2>
            {fields.length > 0 && (
              <span className="text-[11px] text-[var(--ink-mute)]">
                {fields.length} total
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--ink-mute)]">
            Asked in order. The bot stops at the first unanswered required question.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          variant="outline"
          disabled={disabled}
          onClick={handleAddQuestion}
        >
          <Plus size={14} className="mr-1.5" /> Add question
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center">
          <p className="text-sm font-medium text-[var(--ink)]">No questions yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--ink-mute)]">
            Add the questions the bot should ask before a lead counts as qualified.
          </p>
        </div>
      )}

      {/* pr-1.5 keeps the cards' focus rings clear of the scrollbar once the list overflows */}
      <div
        ref={listRef}
        className={cn(
          'flex flex-col gap-4',
          fields.length > 3 && `scroll-themed overflow-y-auto pr-1.5 ${VISIBLE_QUESTIONS_HEIGHT}`,
        )}
      >
        {fields.map((field, index) => {
          const inputType = questions?.[index]?.inputType;

          return (
            <article
              key={field.id}
              className="flex flex-col gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-5"
            >
              <div className="flex items-start gap-2">
                <div className="flex shrink-0 flex-col gap-0.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move question up"
                    disabled={disabled || index === 0}
                    onClick={() => swap(index, index - 1)}
                  >
                    <ChevronUp size={12} />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Move question down"
                    disabled={disabled || index === fields.length - 1}
                    onClick={() => swap(index, index + 1)}
                  >
                    <ChevronDown size={12} />
                  </Button>
                </div>

                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
                    Question {index + 1}
                  </span>
                  <FormField
                    control={form.control}
                    name={`questions.${index}.questionText`}
                    render={({ field: questionTextField }) => (
                      <FormItem className="mt-1">
                        <FormControl>
                          <Input
                            placeholder="What's your monthly marketing budget?"
                            disabled={disabled}
                            {...questionTextField}
                            onChange={(event) => {
                              handleQuestionTextChange(index, event.target.value);
                              questionTextField.onChange(event);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete question"
                  className="mt-6 shrink-0 text-[var(--ink-mute)] hover:text-destructive"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`questions.${index}.inputType`}
                  render={({ field: inputTypeField }) => (
                    <FormItem>
                      <FormLabel>Answer type</FormLabel>
                      <FormControl>
                        <NativeSelect size="lg" disabled={disabled} {...inputTypeField}>
                          {QUESTION_INPUT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {QUESTION_INPUT_TYPE_LABELS[type]}
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
                  name={`questions.${index}.mapsToLeadField`}
                  render={({ field: mapsToField }) => (
                    <FormItem>
                      <FormLabel>Save to lead field</FormLabel>
                      <FormControl>
                        <NativeSelect
                          size="lg"
                          disabled={disabled}
                          value={mapsToField.value ?? ''}
                          onChange={(e) => mapsToField.onChange(e.target.value || null)}
                        >
                          <option value="">Don&apos;t save</option>
                          {LEAD_FIELD_MAPPINGS.map((leadField) => (
                            <option key={leadField} value={leadField}>
                              {leadField}
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {inputType === 'QUICK_REPLY' && (
                <FormField
                  control={form.control}
                  name={`questions.${index}.options`}
                  render={({ field: optionsField }) => (
                    <FormItem>
                      <FormControl>
                        <EditableListField
                          label="Reply options"
                          values={optionsField.value ?? []}
                          onChange={optionsField.onChange}
                          placeholder="e.g. Under 50k"
                          addLabel="Add option"
                          emptyHint="Quick replies need at least two options."
                          disabled={disabled}
                          showOrderHandle
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                <FormField
                  control={form.control}
                  name={`questions.${index}.isRequired`}
                  render={({ field: isRequiredField }) => (
                    <FormItem className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={isRequiredField.value}
                          disabled={disabled}
                          onCheckedChange={isRequiredField.onChange}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="cursor-pointer">Required</FormLabel>
                        <FormDescription>
                          The bot waits here until it gets an answer.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* The storage key is derived, not typed — but once answers reference it,
                    it stops moving, and that is worth saying out loud. */}
                {savedFieldNames.has(questions?.[index]?.fieldName ?? '') && (
                  <p className="text-[11px] text-[var(--ink-mute)]">
                    Answers saved under{' '}
                    <code className="rounded border border-[var(--line)] bg-[var(--surface)] px-1 py-0.5 font-mono text-[10.5px] text-[var(--ink-soft)]">
                      {questions?.[index]?.fieldName}
                    </code>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
