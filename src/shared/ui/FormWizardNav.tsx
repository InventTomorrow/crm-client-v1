'use client';
import { cn } from '@/lib/utils';
import type { FormWizardStepState } from '@/shared/hooks/useFormWizard';
import { Button } from '@/shared/ui/Button';
import { Check } from 'lucide-react';
import type { FieldValues } from 'react-hook-form';

interface FormWizardNavProps<TFieldValues extends FieldValues> {
  title: string;
  stepStates: FormWizardStepState<TFieldValues>[];
  completedRequiredCount: number;
  requiredStepCount: number;
  onStepSelect: (stepIndex: number) => void;
}

/** Section rail for a stepped form — doubles as the checklist, so progress is readable
 * without opening every section. */
export function FormWizardNav<TFieldValues extends FieldValues>({
  title,
  stepStates,
  completedRequiredCount,
  requiredStepCount,
  onStepSelect,
}: FormWizardNavProps<TFieldValues>) {
  const progressPercent =
    requiredStepCount === 0 ? 100 : (completedRequiredCount / requiredStepCount) * 100;

  return (
    <nav className="card h-fit shrink-0 p-3.5 lg:sticky lg:top-4 lg:w-[220px]">
      <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
        {title}
      </div>

      <div className="scroll flex gap-1 overflow-x-auto lg:flex-col lg:overflow-x-visible">
        {stepStates.map(({ step, index, isComplete, isActive, isReachable }) => (
          <Button
            key={step.id}
            type="button"
            variant="ghost"
            disabled={!isReachable}
            onClick={() => onStepSelect(index)}
            className={cn(
              'h-auto w-auto shrink-0 justify-start gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] lg:w-full',
              isActive
                ? 'bg-[var(--accent-soft)] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)]'
                : 'bg-transparent font-medium text-[var(--ink-soft)]',
              // Locked steps keep the label readable — only the check indicator reads as inactive.
              !isReachable && 'cursor-not-allowed disabled:opacity-100',
            )}
          >
            <span
              className={cn(
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ring-2 transition-colors',
                isComplete && isReachable
                  ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--surface)] ring-[var(--accent-soft)]'
                  : 'border-[var(--line)] bg-[var(--surface-2)] ring-[var(--surface-2)]',
                !isReachable && 'opacity-40',
              )}
            >
              {isComplete && isReachable && <Check size={11} strokeWidth={3} />}
            </span>
            <span className="flex-1 truncate">{step.label}</span>
            {step.isOptional && !isComplete && (
              <span className="text-[9.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)] opacity-70">
                Optional
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="mt-3 border-t border-[var(--line)] px-2.5 pt-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ink-mute)]">
          <span>Completed</span>
          <span className="text-[var(--ink)]">
            {completedRequiredCount} of {requiredStepCount}
          </span>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </nav>
  );
}
