'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { businessHoursFormSchema, type BusinessHoursForm } from '../types';
import {
  DEFAULT_BUSINESS_HOURS_FORM,
  toBusinessHoursForm,
  toBusinessHoursPayload,
} from '../utils/businessHours';
import { useChatbotConfig, useUpdateBusinessHours } from './useChatbotSettings';

export function useBusinessHoursForm() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: saveBusinessHours, isPending: isSaving } = useUpdateBusinessHours();

  const form = useForm<BusinessHoursForm>({
    resolver: zodResolver(businessHoursFormSchema),
    defaultValues: DEFAULT_BUSINESS_HOURS_FORM,
  });

  useEffect(() => {
    if (!data) return;
    form.reset(toBusinessHoursForm(data.config?.businessHours), KEEP_FIELD_REFS);
  }, [data, form]);

  const submit = form.handleSubmit((values) =>
    saveBusinessHours(toBusinessHoursPayload(values), {
      onSuccess: () => form.reset(values, KEEP_FIELD_REFS),
    }),
  );

  return { form, submit, isLoading, isSaving };
}
