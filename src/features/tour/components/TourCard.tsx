'use client';
import { Button } from '@/shared/ui/Button';
import { Loader2, X } from 'lucide-react';
import type { CardComponentProps } from 'nextstepjs';
import { useKeepCardInViewport } from '../hooks/useKeepCardInViewport';
import { useTourNavigationStore } from '../stores/tourNavigationStore';

/** Tour tooltip. `currentStep` is zero-based. */
export function TourCard({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CardComponentProps) {
  const { cardRef, correction } = useKeepCardInViewport(`${step.title}:${currentStep}`);
  const navigatingFromStep = useTourNavigationStore((state) => state.navigatingFromStep);
  const startNavigation = useTourNavigationStore((state) => state.startNavigation);
  const clearNavigation = useTourNavigationStore((state) => state.clearNavigation);

  const stepNumber = currentStep + 1;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  // Cleared for free: once the step advances, this no longer matches.
  const isNavigating = navigatingFromStep === currentStep;

  const goNext = () => {
    if (step.nextRoute) startNavigation(currentStep);
    nextStep();
  };

  const goBack = () => {
    if (step.prevRoute) startNavigation(currentStep);
    prevStep();
  };

  const leaveTour = () => {
    clearNavigation();
    skipTour?.();
  };

  return (
    <div
      ref={cardRef}
      style={{ transform: `translate(${correction.x}px, ${correction.y}px)` }}
      className="card-2 relative w-[min(340px,calc(100vw-24px))] bg-[var(--surface)] p-4"
    >
      {skipTour && !isLastStep && (
        <button
          type="button"
          onClick={leaveTour}
          aria-label="Skip tour"
          className="absolute right-3 top-3 rounded-md p-1 text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
        >
          <X size={14} />
        </button>
      )}

      <h3 className="pr-6 text-[14.5px] font-semibold text-[var(--ink)]">{step.title}</h3>
      <div className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
        {step.content}
      </div>

      <div className="mt-3.5 flex items-center gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={
              index === currentStep
                ? 'h-1 w-5 rounded-full bg-[var(--accent)] transition-all'
                : 'h-1 w-1.5 rounded-full bg-[var(--line)] transition-all'
            }
          />
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <span className="shrink-0 text-[11.5px] text-[var(--ink-mute)]">
          {isNavigating ? 'Opening the next page…' : `${stepNumber} of ${totalSteps}`}
        </span>
        <div className="flex items-center gap-2">
          {!isFirstStep && (
            <Button variant="outline" size="sm" onClick={goBack} disabled={isNavigating}>
              Back
            </Button>
          )}
          <Button size="sm" onClick={goNext} disabled={isNavigating}>
            {isNavigating && <Loader2 size={13} className="animate-spin" />}
            {isLastStep ? 'Got it' : 'Next'}
          </Button>
        </div>
      </div>

      {/* The caret is positioned against the spotlight, so undo the card's nudge. */}
      <span
        aria-hidden
        style={{ transform: `translate(${-correction.x}px, ${-correction.y}px)` }}
        className="pointer-events-none absolute inset-0"
      >
        {arrow}
      </span>
    </div>
  );
}
