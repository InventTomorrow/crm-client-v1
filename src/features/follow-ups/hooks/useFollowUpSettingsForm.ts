'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { followUpSettingsSchema, type FollowUpSettingsForm } from '../types';
import { useFollowUpSettings, useUpdateFollowUpSettings } from './useFollowUpSettings';

const DEFAULT_SETTINGS: FollowUpSettingsForm = {
  enabled: false,
  intervalHours: 24,
  maxAttempts: 2,
  dailyLimit: 100,
  priority: ['HOT', 'WARM', 'PROSPECT'],
};

export function useFollowUpSettingsForm() {
  const { data: view, isLoading } = useFollowUpSettings();
  const { mutate: saveSettings, isPending: isSaving } = useUpdateFollowUpSettings();

  const form = useForm<FollowUpSettingsForm>({
    resolver: zodResolver(followUpSettingsSchema),
    defaultValues: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    if (!view) return;
    const { enabled, intervalHours, maxAttempts, dailyLimit, priority } = view.settings;
    form.reset({ enabled, intervalHours, maxAttempts, dailyLimit, priority }, KEEP_FIELD_REFS);
  }, [view, form]);

  const dailyLimit = useWatch({ control: form.control, name: 'dailyLimit' });
  // Settings only matter while follow-ups are on, so they lock when the switch is off.
  const areSettingsEditable = useWatch({ control: form.control, name: 'enabled' });
  const highRiskDailyLimit = view?.highRiskDailyLimit ?? 150;
  // Warn as they type, not only after saving: the server never blocks a high limit.
  const isHighRiskLimit = Number.isFinite(dailyLimit) && dailyLimit > highRiskDailyLimit;
  const effectiveDailyLimit = view?.effectiveDailyLimit ?? dailyLimit;
  const isCappedByNumberAge = !!view && view.effectiveDailyLimit < view.settings.dailyLimit;

  const submit = form.handleSubmit((settings) =>
    saveSettings(settings, { onSuccess: () => form.reset(settings, KEEP_FIELD_REFS) }),
  );

  return {
    form,
    submit,
    isLoading,
    isSaving,
    isAvailable: view?.isAvailable ?? false,
    areSettingsEditable,
    eligibleStatuses: view?.eligibleStatuses ?? [],
    numberAgeDays: view?.numberAgeDays ?? 0,
    highRiskDailyLimit,
    isHighRiskLimit,
    effectiveDailyLimit,
    isCappedByNumberAge,
  };
}
