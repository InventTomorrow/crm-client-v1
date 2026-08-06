'use client';
import { FormField, FormItem, FormMessage } from '@/shared/ui/form';
import { useWatch } from 'react-hook-form';
import type { ServiceFormSectionProps, ServicePlanFormData } from '../../types';
import { PlanBuilder } from '../PlanBuilder';

export function ServicePlansFields({ form, isSaving }: ServiceFormSectionProps) {
  const plans = (useWatch({ control: form.control, name: 'plans' }) ??
    []) as ServicePlanFormData[];
  const currency = useWatch({ control: form.control, name: 'currency' }) || 'PKR';

  return (
    <>
      <PlanBuilder
        plans={plans}
        currency={currency}
        disabled={isSaving}
        // Revalidates so the "tiered pricing needs a plan" error clears as soon as one is added.
        onChange={(updatedPlans) =>
          form.setValue('plans', updatedPlans, { shouldDirty: true, shouldValidate: true })
        }
      />

      {/* Surfaces the tiered-pricing-needs-a-plan rule, which PlanBuilder has no field of its own for */}
      <FormField
        control={form.control}
        name="plans"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
