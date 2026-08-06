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
import { MAX_FIELD_NAME_LENGTH, fallbackFieldName, toFieldName } from '../utils/fieldName';

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
   * Keeps an unsaved question's field name following its text. It stops on two signals,
   * both of which mean the key is now owned by someone else:
   *  - the key has been saved, so answers and scoring rules already reference it;
   *  - the key no longer matches what this question's text derives, i.e. it was hand-edited.
   */
  function handleQuestionTextChange(index: number, previousText: string, nextText: string) {
    const currentFieldName = form.getValues(`questions.${index}.fieldName`) ?? '';
    if (savedFieldNames.has(currentFieldName)) return;
    if (currentFieldName && currentFieldName !== toFieldName(previousText)) return;

    form.setValue(
      `questions.${index}.fieldName`,
      toFieldName(nextText) || fallbackFieldName(index),
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
                              handleQuestionTextChange(
                                index,
                                questionTextField.value,
                                event.target.value,
                              );
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
                  name={`questions.${index}.fieldName`}
                  render={({ field: fieldNameField }) => {
                    const isCommittedKey = savedFieldNames.has(fieldNameField.value);
                    return (
                      <FormItem>
                        <FormLabel>Field name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="monthlyBudget"
                            maxLength={MAX_FIELD_NAME_LENGTH}
                            disabled={disabled}
                            {...fieldNameField}
                          />
                        </FormControl>
                        <FormDescription>
                          {isCommittedKey
                            ? 'Saved answers use this key — renaming it unlinks them.'
                            : 'Filled in from the question. Edit it to set your own.'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                <FormField
                  control={form.control}
                  name={`questions.${index}.isRequired`}
                  render={({ field: isRequiredField }) => (
                    <FormItem>
                      <FormLabel>Required</FormLabel>
                      <FormControl>
                        <div className="flex h-10 items-center">
                          <Switch
                            checked={isRequiredField.value}
                            disabled={disabled}
                            onCheckedChange={isRequiredField.onChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
