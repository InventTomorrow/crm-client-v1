'use client';
import { extractErrorMessage } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import {
  getLeadQualification,
  getQualificationForm,
  recordQualificationAnswer,
  upsertQualificationForm,
} from '../services/qualificationService';
import { qualificationFormSchema, type QualificationFormData } from '../types';

const qualificationKeys = {
  form: ['qualification', 'form'] as const,
  lead: (leadId: string) => ['qualification', 'lead', leadId] as const,
};

const INITIAL_FORM_VALUES = {
  isActive: true,
  hotThreshold: 40,
  warmThreshold: 20,
  questions: [],
  scoringRules: [],
} satisfies z.input<typeof qualificationFormSchema>;

export function useQualificationFormQuery() {
  return useQuery({
    queryKey: qualificationKeys.form,
    queryFn: getQualificationForm,
  });
}

export function useUpsertQualificationForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: QualificationFormData) => upsertQualificationForm(payload),
    onSuccess: (updatedForm) => {
      queryClient.setQueryData(qualificationKeys.form, updatedForm);
      toast.success('Bot questions saved');
    },
    onError: (error) =>
      toast.error(extractErrorMessage(error, 'Failed to save bot questions')),
  });
}

export function useLeadQualificationQuery(leadId: string | null) {
  return useQuery({
    queryKey: qualificationKeys.lead(leadId ?? ''),
    queryFn: () => getLeadQualification(leadId!),
    enabled: !!leadId,
  });
}

/**
 * Saves answers one at a time — the API scores after each, so a partial fill still
 * counts. Sequential rather than parallel: every call recomputes the same lead row,
 * and concurrent writes would race each other's answer map.
 */
export function useRecordQualificationAnswers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: { leadId: string; answers: Record<string, string> }) => {
      for (const [fieldName, value] of Object.entries(variables.answers)) {
        if (!value.trim()) continue;
        await recordQualificationAnswer(variables.leadId, { fieldName, value });
      }
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: qualificationKeys.lead(variables.leadId) });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error, 'Failed to save answers')),
  });
}

/** Owns the qualification form page: loads the saved form, wires react-hook-form with question
 * and scoring-rule field arrays, and upserts on submit. `onSaved` fires only after the upsert
 * lands, so the caller can leave the editor without racing the request. */
export function useQualificationForm(options?: { onSaved?: () => void }) {
  const { data: savedForm, isLoading } = useQualificationFormQuery();

  const form = useForm<
    z.input<typeof qualificationFormSchema>,
    unknown,
    QualificationFormData
  >({
    resolver: zodResolver(qualificationFormSchema),
    defaultValues: INITIAL_FORM_VALUES,
  });

  useEffect(() => {
    if (!savedForm) return;
    form.reset({
      isActive: savedForm.isActive,
      hotThreshold: savedForm.hotThreshold,
      warmThreshold: savedForm.warmThreshold,
      questions: savedForm.questions ?? [],
      scoringRules: savedForm.scoringRules ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedForm]);

  const questionFields = useFieldArray({ control: form.control, name: 'questions' });
  const scoringRuleFields = useFieldArray({ control: form.control, name: 'scoringRules' });

  const upsertForm = useUpsertQualificationForm();

  const handleSubmit = form.handleSubmit((formData) => {
    upsertForm.mutate(
      {
        ...formData,
        // Order is positional in the UI; persist it that way rather than trusting a stale field.
        questions: formData.questions.map((question, index) => ({
          ...question,
          order: index,
          options: question.inputType === 'QUICK_REPLY' ? question.options.filter(Boolean) : [],
          mapsToLeadField: question.mapsToLeadField || null,
        })),
      },
      { onSuccess: () => options?.onSaved?.() },
    );
  });

  // Keys that already exist in the saved form. Those are live storage keys — referenced by
  // LeadQualification.answers, scoring rules and resource conditions — so the builder must
  // never rewrite them, however the question text changes.
  const savedFieldNames = useMemo(
    () => new Set((savedForm?.questions ?? []).map((question) => question.fieldName)),
    [savedForm],
  );

  return {
    form,
    isLoading,
    isSaving: upsertForm.isPending,
    questionFields,
    scoringRuleFields,
    savedFieldNames,
    savedVersion: savedForm?.version,
    handleSubmit,
  };
}
