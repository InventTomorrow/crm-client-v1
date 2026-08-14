'use client';
import { useFormWizard } from '@/shared/hooks/useFormWizard';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { FormSection } from '@/shared/ui/FormSection';
import { FormWizardNav } from '@/shared/ui/FormWizardNav';
import { Input } from '@/shared/ui/Input';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Switch } from '@/shared/ui/Switch';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useQualificationForm } from '../hooks/useQualification';
import { QUALIFICATION_FORM_STEPS } from '../utils/qualificationFormSections';
import { QuestionBuilder } from './QuestionBuilder';
import { ScoringRulesBuilder } from './ScoringRulesBuilder';

export function QualificationFormView() {
  const router = useRouter();
  const returnToPreview = () => router.push('/qualification');

  const {
    form,
    isLoading,
    isSaving,
    questionFields,
    scoringRuleFields,
    savedFieldNames,
    savedVersion,
    submitForm,
  } = useQualificationForm({ onSaved: returnToPreview });

  const hotThreshold = useWatch({ control: form.control, name: 'hotThreshold' });
  const warmThreshold = useWatch({ control: form.control, name: 'warmThreshold' });

  // Always an edit of a saved config, so sections open freely — but Save still waits for the
  // two that genuinely gate a working form (questions, thresholds).
  const wizard = useFormWizard({
    form,
    steps: QUALIFICATION_FORM_STEPS,
    navigation: 'free',
    gateSubmitOnCompletion: true,
  });

  const { activeStep } = wizard;

  // isSaving covers both buttons at once — track which one was actually clicked so
  // only that button shows the spinner. Cleared as soon as the save settles, by
  // noticing the isSaving transition during render rather than in an effect.
  const [pendingAction, setPendingAction] = useState<'next' | 'quit' | null>(null);
  const [wasSaving, setWasSaving] = useState(isSaving);
  if (isSaving !== wasSaving) {
    setWasSaving(isSaving);
    if (!isSaving) setPendingAction(null);
  }

  function handleSaveAndQuit() {
    setPendingAction('quit');
    submitForm(returnToPreview);
  }

  function handleSaveAndNext() {
    setPendingAction('next');
    submitForm(wizard.goToNextStep);
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to bot questions"
            onClick={returnToPreview}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">Bot questions</h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              What the bot asks a new lead, and how their answers score them.
            </p>
          </div>
        </div>
        {savedVersion != null && savedVersion > 0 && (
          <Badge variant="secondary" className="text-[10px]">
            Version {savedVersion}
          </Badge>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={(event) => event.preventDefault()}
          className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-8"
        >
          <FormWizardNav
            title="Sections"
            stepStates={wizard.stepStates}
            completedRequiredCount={wizard.completedRequiredCount}
            requiredStepCount={wizard.requiredStepCount}
            onStepSelect={wizard.goToStep}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <FormSection
              hideLabelColumn
              Icon={activeStep.Icon}
              title={activeStep.title}
              description={activeStep.description}
            >
              {activeStep.id === 'status' && (
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
                        <div>
                          <FormLabel>Active</FormLabel>
                          <p className="mt-0.5 text-xs text-[var(--ink-mute)]">
                            While off, leads still arrive — they just come in unscored.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            disabled={isSaving}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {activeStep.id === 'questions' && (
                <>
                  <QuestionBuilder
                    form={form}
                    fieldArray={questionFields}
                    savedFieldNames={savedFieldNames}
                    disabled={isSaving}
                  />
                  <FormField
                    control={form.control}
                    name="questions"
                    render={() => (
                      <FormItem>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {activeStep.id === 'scoring' && (
                <ScoringRulesBuilder
                  form={form}
                  fieldArray={scoringRuleFields}
                  disabled={isSaving}
                />
              )}

              {activeStep.id === 'thresholds' && (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hotThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hot at or above</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isSaving}
                              {...field}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="warmThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Warm at or above</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              disabled={isSaving}
                              {...field}
                              onChange={(event) => field.onChange(Number(event.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Anything below this scores as cold.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Reads the thresholds back as the three bands they actually produce */}
                  <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-xs">
                    <span className="text-[var(--ink-mute)]">Bands:</span>
                    <span className="text-[var(--ink)]">Cold &lt; {warmThreshold}</span>
                    <span className="text-[var(--ink-mute)]">·</span>
                    <span className="text-[var(--ink)]">
                      Warm {warmThreshold}–
                      {Math.max(Number(hotThreshold) - 1, Number(warmThreshold))}
                    </span>
                    <span className="text-[var(--ink-mute)]">·</span>
                    <span className="text-[var(--ink)]">Hot ≥ {hotThreshold}</span>
                  </div>
                </>
              )}
            </FormSection>

            <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
              {!wizard.isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isSaving}
                  onClick={wizard.goToPreviousStep}
                  className="mr-auto"
                >
                  Back
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={isSaving || !wizard.canSubmit}
                title={
                  wizard.canSubmit
                    ? undefined
                    : `Finish every section first — ${wizard.completedRequiredCount} of ${wizard.requiredStepCount} done.`
                }
                onClick={handleSaveAndQuit}
              >
                {pendingAction === 'quit' ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…
                  </>
                ) : (
                  'Save and quit'
                )}
              </Button>

              {!wizard.isLastStep && (
                <Button
                  type="button"
                  size="lg"
                  disabled={isSaving || !wizard.canSubmit}
                  title={
                    wizard.canSubmit
                      ? undefined
                      : `Finish every section first — ${wizard.completedRequiredCount} of ${wizard.requiredStepCount} done.`
                  }
                  onClick={handleSaveAndNext}
                >
                  {pendingAction === 'next' ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      Save and next
                      <ArrowRight size={14} className="ml-1.5" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
