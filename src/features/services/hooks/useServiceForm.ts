'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import {
  serviceOfferingFormSchema,
  serviceOfferingWizardSchema,
  type ServiceOfferingFormData,
} from '../types';
import {
  INITIAL_SERVICE_FORM_VALUES,
  toServiceFormValues,
  toServicePayload,
} from '../utils/serviceFormMapping';
import {
  useCreateServiceOffering,
  useServiceOffering,
  useUpdateServiceOffering,
} from './useServices';

/** Owns the service offering form page: loads the offering in edit mode, wires react-hook-form,
 * and submits through create or update depending on mode. */
export function useServiceForm(serviceId?: string) {
  const router = useRouter();
  const isEditMode = !!serviceId;
  const { data: existingService, isLoading: isLoadingService } = useServiceOffering(serviceId);

  // Adding a service enforces the stricter wizard rules; editing falls back to the plain
  // schema so services saved before those rules exist can still be updated.
  const form = useForm<
    z.input<typeof serviceOfferingFormSchema>,
    unknown,
    ServiceOfferingFormData
  >({
    resolver: isEditMode
      ? zodResolver(serviceOfferingFormSchema)
      : zodResolver(serviceOfferingWizardSchema),
    defaultValues: INITIAL_SERVICE_FORM_VALUES,
  });

  useEffect(() => {
    if (existingService) form.reset(toServiceFormValues(existingService));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingService]);

  const createService = useCreateServiceOffering();
  const updateService = useUpdateServiceOffering();
  const isSaving = createService.isPending || updateService.isPending;

  // Saving lands on the service's own preview so the change can be read back in full rather
  // than inferred from a card in the list.
  const handleSubmit = form.handleSubmit((formData) => {
    const payload = toServicePayload(formData);
    const goToPreview = (savedService: { id: string }) =>
      router.push(`/services/${savedService.id}`);

    if (isEditMode && serviceId) {
      updateService.mutate({ serviceId, payload }, { onSuccess: goToPreview });
    } else {
      createService.mutate(payload, { onSuccess: goToPreview });
    }
  });

  return { form, isEditMode, isLoadingService, isSaving, handleSubmit };
}
