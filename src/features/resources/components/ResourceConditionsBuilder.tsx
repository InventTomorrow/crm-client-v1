'use client';
import { useQualificationFormQuery } from '@/features/qualification/hooks/useQualification';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import type { ResourceConditions } from '../types';

interface ResourceConditionsBuilderProps {
  value: ResourceConditions;
  onChange: (conditions: ResourceConditions) => void;
  disabled?: boolean;
}

/**
 * Builds the condition map against the workspace's real qualification questions,
 * so a rule can never point at a field the bot never asks. Quick-reply questions
 * offer their saved options; everything else takes free text.
 */
export function ResourceConditionsBuilder({
  value,
  onChange,
  disabled,
}: ResourceConditionsBuilderProps) {
  const { data: qualificationForm } = useQualificationFormQuery();
  const [selectedField, setSelectedField] = useState('');
  const [draftValue, setDraftValue] = useState('');

  const questions = qualificationForm?.questions ?? [];
  const usedFields = Object.keys(value);
  const availableQuestions = questions.filter(
    (question) => !usedFields.includes(question.fieldName),
  );

  const activeQuestion = questions.find((question) => question.fieldName === selectedField);
  const quickReplyOptions =
    activeQuestion?.inputType === 'QUICK_REPLY'
      ? activeQuestion.options.filter(Boolean)
      : [];

  const addCondition = () => {
    const trimmedValue = draftValue.trim();
    if (!selectedField || !trimmedValue) return;

    const existingValues = value[selectedField] ?? [];
    if (existingValues.includes(trimmedValue)) return;

    onChange({ ...value, [selectedField]: [...existingValues, trimmedValue] });
    setDraftValue('');
  };

  const removeValue = (fieldName: string, valueToRemove: string) => {
    const remaining = (value[fieldName] ?? []).filter((v) => v !== valueToRemove);
    const next = { ...value };
    // A field with no values left is no longer a condition at all.
    if (remaining.length === 0) delete next[fieldName];
    else next[fieldName] = remaining;
    onChange(next);
  };

  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-center text-[11.5px] text-[var(--ink-mute)]">
        No qualification questions yet — add some first to target this file at specific leads.
        For now it will be shared with everyone.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={selectedField}
          onValueChange={(fieldName) => {
            setSelectedField(fieldName);
            setDraftValue('');
          }}
          disabled={disabled}
        >
          <SelectTrigger size="lg" className="w-full sm:w-[200px]">
            <SelectValue placeholder="Pick a question" />
          </SelectTrigger>
          <SelectContent>
            {/* Fields already in use stay listed so more values can be OR'd onto them. */}
            {[...availableQuestions, ...questions.filter((q) => usedFields.includes(q.fieldName))]
              .map((question) => (
                <SelectItem key={question.fieldName} value={question.fieldName}>
                  {question.fieldName}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {quickReplyOptions.length > 0 ? (
          <Select
            value={draftValue}
            onValueChange={setDraftValue}
            disabled={disabled || !selectedField}
          >
            <SelectTrigger size="lg" className="flex-1">
              <SelectValue placeholder="Pick an answer" />
            </SelectTrigger>
            <SelectContent>
              {quickReplyOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            className="flex-1"
            placeholder="Matching answer"
            value={draftValue}
            disabled={disabled || !selectedField}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              addCondition();
            }}
          />
        )}

        <Button
          type="button"
          variant="outline"
          size="xl"
          onClick={addCondition}
          disabled={disabled || !selectedField || !draftValue.trim()}
        >
          <Plus size={14} className="mr-1.5" /> Add
        </Button>
      </div>

      {usedFields.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-center text-[11.5px] text-[var(--ink-mute)]">
          No conditions — this file is shared with every lead.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {usedFields.map((fieldName, fieldIndex) => (
            <div
              key={fieldName}
              className={cn(
                'rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3',
              )}
            >
              <p className="text-[11.5px] text-[var(--ink-mute)]">
                {fieldIndex > 0 && <span className="font-medium text-[var(--ink)]">AND </span>}
                {fieldName} is any of
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(value[fieldName] ?? []).map((allowedValue) => (
                  <span
                    key={allowedValue}
                    className="flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] py-1 pl-2.5 pr-1.5 text-[11.5px] font-medium text-[var(--ink)]"
                  >
                    {allowedValue}
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => removeValue(fieldName, allowedValue)}
                      aria-label={`Remove ${allowedValue}`}
                      className="text-[var(--ink-mute)] transition-colors hover:text-destructive disabled:pointer-events-none"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
