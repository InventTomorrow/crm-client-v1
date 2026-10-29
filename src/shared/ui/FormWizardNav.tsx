"use client";
import { cn } from "@/lib/utils";
import type { FormWizardStepState } from "@/shared/hooks/useFormWizard";
import { FormWizardStepTabs } from "@/shared/ui/FormWizardStepTabs";
import { Check } from "lucide-react";
import type { FieldValues } from "react-hook-form";

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
    requiredStepCount === 0
      ? 100
      : (completedRequiredCount / requiredStepCount) * 100;

  return (
    <>
      <FormWizardStepTabs
        tabs={stepStates.map(({ step, isComplete, isActive, isReachable }) => ({
          id: step.id,
          label: step.label,
          isActive,
          isComplete,
          isLocked: !isReachable,
        }))}
        onStepSelect={onStepSelect}
        className="md:-mx-8 md:px-8 lg:hidden"
      />

      <nav className="card sticky top-4 hidden h-fit w-[240px] shrink-0 overflow-hidden p-0 lg:block">
        <div className="border-b border-[var(--line)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
          {title}
        </div>

        <div className="flex flex-col divide-y divide-[var(--line)]">
          {stepStates.map(
            ({ step, index, isComplete, isActive, isReachable }) => (
              <button
                key={step.id}
                type="button"
                disabled={!isReachable}
                onClick={() => onStepSelect(index)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "relative flex w-full items-center gap-2.5 border-l-2 py-3 pl-3.5 pr-9 text-left text-[13.5px] transition-colors",
                  isActive
                    ? "border-[var(--accent)] bg-[var(--surface-2)] font-semibold text-[var(--ink)]"
                    : "border-transparent font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
                  !isReachable &&
                    "cursor-not-allowed opacity-50 hover:bg-transparent",
                )}
              >
                <step.Icon
                  size={15}
                  className={cn(
                    "shrink-0",
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-mute)]",
                  )}
                />
                <span className="truncate">{step.label}</span>
                {step.isOptional && !isComplete && (
                  <span className="text-[9.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                    Optional
                  </span>
                )}
                {isComplete && isReachable && (
                  <Check
                    size={14}
                    strokeWidth={3}
                    aria-label="Complete"
                    className="absolute right-3 top-3.5 text-[var(--accent)]"
                  />
                )}
              </button>
            ),
          )}
        </div>

        <div className="border-t border-[var(--line)] px-4 py-3">
          <div className="flex items-center justify-between text-[11px] font-medium text-[var(--ink-mute)]">
            <span>Completed</span>
            <span className="text-[var(--ink)]">
              {completedRequiredCount} of {requiredStepCount}
            </span>
          </div>
          <div className="mt-2 h-1 bg-[var(--line)]">
            <div
              className="h-full bg-[var(--accent)] transition-[width] duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </nav>
    </>
  );
}
