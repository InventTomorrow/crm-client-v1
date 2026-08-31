"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  type LucideIcon,
} from "lucide-react";

export interface WizardStep {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  /** One-line recap of what this step holds, shown under its title in the rail. */
  summary: string;
  /** Renders the summary as a muted placeholder rather than a filled value. */
  isEmpty: boolean;
  hasError: boolean;
}

interface FormWizardProps {
  heading: string;
  subheading: string;
  steps: WizardStep[];
  currentStepIndex: number;
  /** Highest step reached — later steps stay locked so they are filled in order. */
  furthestStepIndex: number;
  onStepSelect: (stepIndex: number) => void;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  isSaving: boolean;
  /** Label for the final step's button, e.g. "Add practitioner". */
  submitLabel: string;
  /** Shown beside the footer buttons once a step has been persisted. */
  savedLabel: string | null;
  children: React.ReactNode;
}

function StepRailItem({
  step,
  index,
  currentStepIndex,
  furthestStepIndex,
  onSelect,
}: {
  step: WizardStep;
  index: number;
  currentStepIndex: number;
  furthestStepIndex: number;
  onSelect: () => void;
}) {
  const isCurrent = index === currentStepIndex;
  const isComplete = index < furthestStepIndex && !step.hasError;
  const isLocked = index > furthestStepIndex;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isLocked}
      aria-current={isCurrent ? "step" : undefined}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
        isCurrent
          ? "border-[var(--accent)] bg-[var(--surface-2)]"
          : "border-transparent hover:bg-[var(--surface-2)]",
        isLocked && "cursor-not-allowed opacity-45 hover:bg-transparent",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-semibold",
          step.hasError
            ? "border-[#DC2626] text-[#DC2626]"
            : isComplete
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : isCurrent
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--ink-mute)]",
        )}
      >
        {isComplete ? <Check size={13} /> : <step.Icon size={13} />}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            "truncate text-[13px] font-semibold",
            isCurrent ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
          )}
        >
          {step.title}
        </span>
        <span
          className={cn(
            "truncate text-[11.5px] leading-relaxed",
            step.hasError
              ? "text-[#DC2626]"
              : step.isEmpty
                ? "text-[var(--ink-mute)] italic"
                : "text-[var(--accent)]",
          )}
        >
          {step.hasError ? "Needs attention" : step.summary}
        </span>
      </span>
    </button>
  );
}

/**
 * A long form split into ordered steps, with a rail that recaps every step as
 * it is filled. The rail doubles as the progress indicator, so the admin can
 * see what a finished step holds without leaving the one they are on.
 *
 * Navigation only — the caller owns validation, persistence and what each step
 * renders.
 */
export function FormWizard({
  heading,
  subheading,
  steps,
  currentStepIndex,
  furthestStepIndex,
  onStepSelect,
  onBack,
  onNext,
  onCancel,
  isSaving,
  submitLabel,
  savedLabel,
  children,
}: FormWizardProps) {
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  if (!currentStep) return null;

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={`Back to ${subheading.toLowerCase()}`}
            onClick={onCancel}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {heading}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">{subheading}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[264px_minmax(0,1fr)] md:items-start lg:gap-8">
          <nav
            aria-label="Form steps"
            className="card sticky top-0 flex flex-col gap-1 p-2 md:top-4"
          >
            {steps.map((step, index) => (
              <StepRailItem
                key={step.id}
                step={step}
                index={index}
                currentStepIndex={currentStepIndex}
                furthestStepIndex={furthestStepIndex}
                onSelect={() => onStepSelect(index)}
              />
            ))}
          </nav>

          <div className="flex min-w-0 flex-col gap-4">
            <section className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-[var(--line)] px-6 py-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
                  <currentStep.Icon size={14} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">
                    {currentStep.title}
                  </h2>
                  <p className="text-[12px] leading-relaxed text-[var(--ink-mute)]">
                    {currentStep.description}
                  </p>
                </div>
                <span className="ml-auto shrink-0 text-[11.5px] text-[var(--ink-mute)]">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </header>

              <div className="flex flex-col gap-5 px-6 py-6">{children}</div>
            </section>

            {/* Pinned: the step buttons stay reachable however long the fields run. */}
            <div className="card sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 px-4 py-3">
              {savedLabel && (
                <span className="mr-auto text-[11.5px] text-[var(--ink-mute)]">
                  {savedLabel}
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  disabled={isSaving}
                >
                  <ChevronLeft className="size-4" />
                  Back
                </Button>
              )}
              <Button type="button" onClick={onNext} disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isLastStep ? submitLabel : "Next"}
                {!isLastStep && !isSaving && <ChevronRight className="size-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
