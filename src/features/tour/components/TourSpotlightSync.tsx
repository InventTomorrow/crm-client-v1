'use client';
import { useNextStep } from 'nextstepjs';
import { useSpotlightSync } from '../hooks/useSpotlightSync';

/** Keeps the cut-out aligned with its target. Renders nothing. */
export function TourSpotlightSync() {
  const { isNextStepVisible, currentStep, currentTour } = useNextStep();

  useSpotlightSync(isNextStepVisible, `${currentTour}:${currentStep}`);

  return null;
}
