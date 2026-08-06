'use client';
import { useFormWizard } from '@/shared/hooks/useFormWizard';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/form';
import { FormSection } from '@/shared/ui/FormSection';
import { FormWizardNav } from '@/shared/ui/FormWizardNav';
import { Skeleton } from '@/shared/ui/Skeleton';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useServiceForm } from '../hooks/useServiceForm';
import { SERVICE_FORM_STEPS } from '../utils/serviceFormSections';
import { ServiceBasicsFields } from './sections/ServiceBasicsFields';
import { ServicePlansFields } from './sections/ServicePlansFields';
import { ServicePositioningFields } from './sections/ServicePositioningFields';
import { ServicePricingFields } from './sections/ServicePricingFields';
import { ServiceVisibilityFields } from './sections/ServiceVisibilityFields';

export function ServiceFormView({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const { form, isEditMode, isLoadingService, isSaving, handleSubmit } = useServiceForm(serviceId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Creating walks the sections in order and holds Save until they are filled. Editing a saved
  // service jumps freely and always allows Save, so records predating these rules stay updatable.
  const wizard = useFormWizard({
    form,
    steps: SERVICE_FORM_STEPS,
    navigation: isEditMode ? 'free' : 'sequential',
    gateSubmitOnCompletion: !isEditMode,
  });

  const { activeStep, activeStepIndex } = wizard;

  // Each section is a fresh screen — start it at the top rather than mid-scroll.
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStepIndex]);

  if (isEditMode && isLoadingService) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="scroll h-full overflow-y-auto">
      <div className="mx-auto max-w-[1100px] p-4 md:p-8">
        {/* Page header */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to services"
            onClick={() => router.push('/services')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {isEditMode ? 'Edit service' : 'Add service'}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">Services catalog</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 lg:flex-row lg:gap-8">
            <FormWizardNav
              title={isEditMode ? 'Sections' : 'Add service'}
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
                {activeStep.id === 'basics' && (
                  <ServiceBasicsFields form={form} isSaving={isSaving} />
                )}
                {activeStep.id === 'pricing' && (
                  <ServicePricingFields form={form} isSaving={isSaving} />
                )}
                {activeStep.id === 'positioning' && (
                  <ServicePositioningFields form={form} isSaving={isSaving} />
                )}
                {activeStep.id === 'plans' && <ServicePlansFields form={form} isSaving={isSaving} />}
                {activeStep.id === 'visibility' && (
                  <ServiceVisibilityFields form={form} isSaving={isSaving} />
                )}
              </FormSection>

              {/* Action bar — sticks to the viewport so Save is reachable from any section */}
              <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--line)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8 lg:mx-0 lg:px-0">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isSaving}
                  onClick={() => router.push('/services')}
                  className="mr-auto"
                >
                  Cancel
                </Button>

                {!wizard.isFirstStep && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={isSaving}
                    onClick={wizard.goToPreviousStep}
                  >
                    Back
                  </Button>
                )}

                {!wizard.isLastStep && (
                  <Button
                    type="button"
                    variant={wizard.canSubmit ? 'outline' : 'default'}
                    size="lg"
                    disabled={isSaving}
                    onClick={wizard.goToNextStep}
                  >
                    Next
                    <ArrowRight size={14} className="ml-1.5" />
                  </Button>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSaving || !wizard.canSubmit}
                  title={
                    wizard.canSubmit
                      ? undefined
                      : `Finish every section first — ${wizard.completedRequiredCount} of ${wizard.requiredStepCount} done.`
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…
                    </>
                  ) : isEditMode ? (
                    'Save changes'
                  ) : (
                    'Add service'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
