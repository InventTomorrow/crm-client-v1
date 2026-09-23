'use client';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useFieldArray, useForm, type FieldErrors } from 'react-hook-form';
import { businessProfileSchema, type BusinessProfileForm } from '../types';
import {
  useChatbotConfig,
  useGenerateBusinessIntro,
  useUpdateBusinessProfile,
} from './useChatbotSettings';

export type BusinessProfileTab = 'about' | 'qa' | 'support';

const DEFAULTS: BusinessProfileForm = {
  businessDescription: '',
  businessInfoMessage: '',
  businessFaqs: [],
  supportName: '',
  supportPhone: '',
  supportEmail: '',
  shareSupportContactOnHandoff: false,
  notifyOnEscalation: false,
  captureCustomizationRequests: false,
};

const TAB_BY_FIELD: Record<keyof BusinessProfileForm, BusinessProfileTab> = {
  businessDescription: 'about',
  businessInfoMessage: 'about',
  businessFaqs: 'qa',
  supportName: 'support',
  supportPhone: 'support',
  supportEmail: 'support',
  shareSupportContactOnHandoff: 'support',
  notifyOnEscalation: 'support',
  captureCustomizationRequests: 'support',
};

/**
 * One form behind the About, Q&A and Support tabs. A failed save opens the tab
 * holding the first error, since the other tabs are hidden.
 */
export function useBusinessProfileForm(onShowTab: (tab: BusinessProfileTab) => void) {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: save, isPending: isSaving } = useUpdateBusinessProfile();
  const { mutate: generate, isPending: isGenerating } = useGenerateBusinessIntro();

  const form = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: DEFAULTS,
  });
  const faqFields = useFieldArray({ control: form.control, name: 'businessFaqs' });

  useEffect(() => {
    if (!data?.config) return;
    form.reset({
      businessDescription: data.config.businessDescription ?? '',
      businessInfoMessage: data.config.businessInfoMessage ?? '',
      businessFaqs: data.config.businessFaqs ?? [],
      supportName: data.config.supportName ?? '',
      supportPhone: data.config.supportPhone ?? '',
      supportEmail: data.config.supportEmail ?? '',
      shareSupportContactOnHandoff: data.config.shareSupportContactOnHandoff ?? false,
      notifyOnEscalation: data.config.notifyOnEscalation ?? false,
      captureCustomizationRequests: data.config.captureCustomizationRequests ?? false,
    }, KEEP_FIELD_REFS);
  }, [data, form]);

  const generateIntro = () => {
    const description = (form.getValues('businessDescription') ?? '').trim();
    if (description.length < 10) return;
    generate(description, {
      onSuccess: (message) => form.setValue('businessInfoMessage', message, { shouldDirty: true }),
    });
  };

  const showFirstErrorTab = (errors: FieldErrors<BusinessProfileForm>) => {
    const firstErrorField = Object.keys(errors)[0] as keyof BusinessProfileForm | undefined;
    if (firstErrorField) onShowTab(TAB_BY_FIELD[firstErrorField]);
  };

  const handleSubmit = form.handleSubmit(
    (values) => save(values, { onSuccess: () => form.reset(values, KEEP_FIELD_REFS) }),
    showFirstErrorTab,
  );

  return { form, faqFields, isLoading, isSaving, isGenerating, generateIntro, handleSubmit };
}
