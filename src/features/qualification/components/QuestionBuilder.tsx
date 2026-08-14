'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/Tooltip';
import { Copy, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
import type { UseFieldArrayReturn, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type { z } from 'zod';
import {
  QUESTION_INPUT_TYPE_LABELS,
  qualificationFormSchema,
  type QualificationFormData,
} from '../types';
import { deriveUniqueFieldName } from '../utils/fieldName';
import { QuestionDialog, type QuestionDialogData } from './QuestionDialog';

type QualificationFormInput = z.input<typeof qualificationFormSchema>;
type QualificationQuestionInput = QualificationFormInput['questions'][number];

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

interface QuestionIconButtonProps {
  label: string;
  disabled?: boolean;
  className?: string;
  onClick: (event: MouseEvent) => void;
  children: ReactNode;
}

/** Icon button with a tooltip that also stops the click from reaching the card
 * behind it — the card itself opens the edit dialog, so these actions must not. */
function QuestionIconButton({ label, disabled, className, onClick, children }: QuestionIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          className={className}
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onClick(event);
          }}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function toDialogData(question: QualificationQuestionInput): QuestionDialogData {
  return {
    questionText: question.questionText,
    inputType: question.inputType,
    options: question.options ?? [],
    isRequired: question.isRequired ?? true,
    mapsToLeadField: question.mapsToLeadField ?? null,
  };
}

export function QuestionBuilder({
  form,
  fieldArray,
  savedFieldNames,
  disabled = false,
}: QuestionBuilderProps) {
  const { fields, append, remove, update, swap } = fieldArray;
  const questions = useWatch({ control: form.control, name: 'questions' });
  const listRef = useRef<HTMLDivElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function fieldNameFor(text: string, index: number, currentFieldName: string) {
    if (savedFieldNames.has(currentFieldName)) return currentFieldName;
    const keysInUse = (form.getValues('questions') ?? [])
      .map((question, questionIndex) => (questionIndex === index ? '' : question.fieldName))
      .filter(Boolean);
    return deriveUniqueFieldName(text, index, keysInUse);
  }

  // Past the third question a new card lands below the fold, so follow it down —
  // otherwise the dialog closing reads as having done nothing.
  function scrollListToEnd() {
    requestAnimationFrame(() => {
      const list = listRef.current;
      if (list) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    });
  }

  function handleAddSubmit(data: QuestionDialogData) {
    const order = fields.length;
    append({
      order,
      fieldName: fieldNameFor(data.questionText, order, ''),
      questionText: data.questionText,
      inputType: data.inputType,
      options: data.options,
      isRequired: data.isRequired,
      mapsToLeadField: data.mapsToLeadField,
    });
    scrollListToEnd();
  }

  function handleEditSubmit(data: QuestionDialogData) {
    if (editingIndex === null) return;
    const current = questions?.[editingIndex];
    update(editingIndex, {
      order: current?.order ?? editingIndex,
      fieldName: fieldNameFor(data.questionText, editingIndex, current?.fieldName ?? ''),
      questionText: data.questionText,
      inputType: data.inputType,
      options: data.options,
      isRequired: data.isRequired,
      mapsToLeadField: data.mapsToLeadField,
    });
  }

  function handleCopy(index: number) {
    const source = questions?.[index];
    if (!source) return;
    const order = fields.length;
    append({
      order,
      fieldName: fieldNameFor(`${source.questionText} copy`, order, ''),
      questionText: source.questionText,
      inputType: source.inputType,
      options: source.options ?? [],
      isRequired: source.isRequired ?? true,
      mapsToLeadField: source.mapsToLeadField ?? null,
    });
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
    scrollListToEnd();
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
          onClick={() => setIsAdding(true)}
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

      <div
        ref={listRef}
        className={cn(
          'flex flex-col gap-2',
          fields.length > 3 && `scroll-themed overflow-y-auto pr-1.5 ${VISIBLE_QUESTIONS_HEIGHT}`,
        )}
      >
        {fields.map((field, index) => {
          const question = questions?.[index];

          return (
            <article
              key={field.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && setEditingIndex(index)}
              onKeyDown={(event) => {
                if (disabled) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setEditingIndex(index);
                }
              }}
              className="flex cursor-pointer items-start gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 hover:border-[var(--ink-mute)]"
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                <QuestionIconButton
                  label="Move question up"
                  disabled={disabled || index === 0}
                  onClick={() => swap(index, index - 1)}
                >
                  <ChevronUp size={12} />
                </QuestionIconButton>
                <QuestionIconButton
                  label="Move question down"
                  disabled={disabled || index === fields.length - 1}
                  onClick={() => swap(index, index + 1)}
                >
                  <ChevronDown size={12} />
                </QuestionIconButton>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
                  Question {index + 1}
                </span>
                <p className="mt-0.5 truncate text-sm text-[var(--ink)]" title={question?.questionText}>
                  {question?.questionText || 'Untitled question'}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[var(--ink-mute)]">
                  <span className="rounded-full border border-[var(--line)] px-2 py-0.5">
                    {question ? QUESTION_INPUT_TYPE_LABELS[question.inputType] : ''}
                  </span>
                  {question?.isRequired && (
                    <span className="rounded-full border border-[var(--line)] px-2 py-0.5">
                      Required
                    </span>
                  )}
                  {question?.mapsToLeadField && (
                    <span className="rounded-full border border-[var(--line)] px-2 py-0.5">
                      Saves to {question.mapsToLeadField}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                <QuestionIconButton
                  label={copiedIndex === index ? 'Copied' : 'Copy question'}
                  disabled={disabled}
                  onClick={() => handleCopy(index)}
                >
                  {copiedIndex === index ? (
                    <span className="text-[10px] text-[var(--ink-mute)]">Copied</span>
                  ) : (
                    <Copy size={13} />
                  )}
                </QuestionIconButton>
                <QuestionIconButton
                  label="Edit question"
                  disabled={disabled}
                  onClick={() => setEditingIndex(index)}
                >
                  <Pencil size={13} />
                </QuestionIconButton>
                <QuestionIconButton
                  label="Delete question"
                  className="text-[var(--ink-mute)] hover:text-destructive"
                  disabled={disabled}
                  onClick={() => remove(index)}
                >
                  <Trash2 size={13} />
                </QuestionIconButton>
              </div>
            </article>
          );
        })}
      </div>

      <QuestionDialog
        open={isAdding}
        onClose={() => setIsAdding(false)}
        onSubmit={handleAddSubmit}
      />

      <QuestionDialog
        open={editingIndex !== null && questions?.[editingIndex] != null}
        initial={editingIndex !== null && questions?.[editingIndex] ? toDialogData(questions[editingIndex]) : null}
        onClose={() => setEditingIndex(null)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
