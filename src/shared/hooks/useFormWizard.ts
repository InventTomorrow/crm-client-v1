'use client';
import type { LucideIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

export interface FormWizardStep<TFieldValues extends FieldValues> {
  id: string;
  /** Shown in the rail — kept short so the nav stays one line per step. */
  label: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  /** Validated by react-hook-form before the step is left. */
  fields: Path<TFieldValues>[];
  /** True once the step holds everything the bot needs — drives the check mark and the Save gate. */
  isComplete: (values: TFieldValues) => boolean;
  /** Sane defaults already cover this step, so it never blocks Save. */
  isOptional?: boolean;
}

export interface FormWizardStepState<TFieldValues extends FieldValues> {
  step: FormWizardStep<TFieldValues>;
  index: number;
  isComplete: boolean;
  isActive: boolean;
  /** False for steps a sequential wizard has not unlocked yet. Always true in free navigation. */
  isReachable: boolean;
}

interface UseFormWizardOptions<TFieldValues extends FieldValues, TContext, TTransformedValues> {
  form: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  steps: FormWizardStep<TFieldValues>[];
  /** `sequential` unlocks steps one Next at a time (creating). `free` lets every step be
   * opened straight away (editing a record that is already saved). */
  navigation: 'sequential' | 'free';
  /** Holds Save disabled until every required step is complete. */
  gateSubmitOnCompletion: boolean;
}

/** Drives a form rendered one section at a time: which step is open, which ones are done,
 * and whether the form may be submitted yet. */
export function useFormWizard<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  form,
  steps,
  navigation,
  gateSubmitOnCompletion,
}: UseFormWizardOptions<TFieldValues, TContext, TTransformedValues>) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [furthestUnlockedIndex, setFurthestUnlockedIndex] = useState(0);

  // Subscribes to the whole form so check marks recompute as fields are typed into.
  // Falls back to the current values for the first render, before the subscription settles.
  const watchedValues = useWatch({ control: form.control });
  const values = (watchedValues ?? form.getValues()) as TFieldValues;

  const completionByStep = useMemo(
    () => steps.map((step) => step.isComplete(values)),
    [steps, values],
  );

  const stepStates: FormWizardStepState<TFieldValues>[] = useMemo(
    () =>
      steps.map((step, index) => ({
        step,
        index,
        isComplete: completionByStep[index],
        isActive: index === activeStepIndex,
        isReachable: navigation === 'free' || index <= furthestUnlockedIndex,
      })),
    [steps, completionByStep, activeStepIndex, furthestUnlockedIndex, navigation],
  );

  const requiredStepCount = steps.filter((step) => !step.isOptional).length;
  const completedRequiredCount = steps.filter(
    (step, index) => !step.isOptional && completionByStep[index],
  ).length;
  const areAllRequiredStepsComplete = completedRequiredCount === requiredStepCount;

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return;
      if (navigation === 'sequential' && stepIndex > furthestUnlockedIndex) return;
      setActiveStepIndex(stepIndex);
    },
    [steps.length, navigation, furthestUnlockedIndex],
  );

  /** Validates the open step before advancing, so errors surface on the fields that caused them. */
  const goToNextStep = useCallback(async () => {
    const isActiveStepValid = await form.trigger(steps[activeStepIndex].fields);
    if (!isActiveStepValid) return;

    const nextStepIndex = activeStepIndex + 1;
    if (nextStepIndex >= steps.length) return;

    setFurthestUnlockedIndex((furthest) => Math.max(furthest, nextStepIndex));
    setActiveStepIndex(nextStepIndex);
  }, [form, steps, activeStepIndex]);

  const goToPreviousStep = useCallback(() => {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  return {
    activeStep: steps[activeStepIndex],
    activeStepIndex,
    stepStates,
    requiredStepCount,
    completedRequiredCount,
    areAllRequiredStepsComplete,
    isFirstStep: activeStepIndex === 0,
    isLastStep: activeStepIndex === steps.length - 1,
    canSubmit: !gateSubmitOnCompletion || areAllRequiredStepsComplete,
    goToStep,
    goToNextStep,
    goToPreviousStep,
  };
}
