'use client';
import type { Step } from 'nextstepjs';
import { useNextStep } from 'nextstepjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** How long a target may stay missing before the step is written off. */
const STUCK_TIMEOUT_MS = 6_000;
/** Breathing room for the next page to mount after we navigate ourselves. */
const ROUTE_SETTLE_MS = 600;

/**
 * Skips steps whose target never appears.
 *
 * NextStep waits on a MutationObserver for a `nextRoute` step's selector, so a
 * page that renders an empty state instead of the expected element leaves the
 * tour parked on the previous card with a Next button that does nothing. Rather
 * than pin the tour to whether a workspace happens to have data, this drops the
 * step and moves on.
 */
export function TourWatchdog({ steps }: { steps: Step[] }) {
  const { isNextStepVisible, currentStep, setCurrentStep, closeNextStep } = useNextStep();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isNextStepVisible || steps.length === 0) return;

    const current = steps[currentStep];
    const pending = steps[currentStep + 1];

    // Case 1: NextStep pushed `nextRoute` and is waiting for the next target.
    const isAwaitingNextRoute = Boolean(current?.nextRoute) && pathname === current?.nextRoute;
    const watched = isAwaitingNextRoute ? pending : current;
    const watchedIndex = isAwaitingNextRoute ? currentStep + 1 : currentStep;

    // Case 2: a same-route target that simply never rendered.
    if (!watched?.selector) return;

    const timer = setTimeout(() => {
      if (document.querySelector(watched.selector as string)) return;

      const nextIndex = watchedIndex + 1;
      const next = steps[nextIndex];
      if (!next) {
        closeNextStep();
        return;
      }

      // We are moving the step ourselves, so we owe it the navigation too.
      const route = steps[watchedIndex]?.nextRoute;
      if (route && route !== pathname) {
        router.push(route);
        setCurrentStep(nextIndex, ROUTE_SETTLE_MS);
        return;
      }
      setCurrentStep(nextIndex);
    }, STUCK_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [
    isNextStepVisible,
    currentStep,
    steps,
    pathname,
    router,
    setCurrentStep,
    closeNextStep,
  ]);

  return null;
}
