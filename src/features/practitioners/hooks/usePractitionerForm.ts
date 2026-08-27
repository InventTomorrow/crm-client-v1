'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  practitionerFormSchema,
  type PractitionerFormValues,
} from '../types';
import {
  INITIAL_PRACTITIONER_FORM_VALUES,
  toPractitionerFormValues,
  type PractitionerFormInput,
} from '../utils/practitionerFormMapping';
import {
  SECTION_FIELDS,
  sectionsWithErrors,
  summariseSection,
  type PractitionerSectionId,
} from '../utils/practitionerSectionSummaries';
import {
  useCreatePractitioner,
  usePractitioner,
  useUpdatePractitioner,
} from './usePractitioners';

const SECTION_IDS = Object.keys(SECTION_FIELDS) as PractitionerSectionId[];

/** Only the first section starts open — the rest are one click away. */
const FIRST_SECTION: PractitionerSectionId[] = [SECTION_IDS[0]!];

/**
 * Owns the practitioner form page: loads the practitioner in edit mode, wires
 * react-hook-form, and submits through create or update depending on mode.
 * Also owns which sections are expanded and the recap each trigger shows.
 */
export function usePractitionerForm(practitionerId?: string) {
  const router = useRouter();
  const isEditMode = Boolean(practitionerId);
  const { data: existingPractitioner, isLoading: isLoadingPractitioner } =
    usePractitioner(practitionerId);

  const form = useForm<
    PractitionerFormInput,
    unknown,
    PractitionerFormValues
  >({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: INITIAL_PRACTITIONER_FORM_VALUES,
  });

  useEffect(() => {
    if (existingPractitioner) {
      form.reset(toPractitionerFormValues(existingPractitioner));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPractitioner]);

  const [openSections, setOpenSections] =
    useState<PractitionerSectionId[]>(FIRST_SECTION);

  // Every value, so a trigger's recap tracks what is being typed rather than
  // what was last saved.
  const values = useWatch({ control: form.control }) as PractitionerFormInput;

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        SECTION_IDS.map((id) => [id, summariseSection(id, values)]),
      ) as Record<PractitionerSectionId, string>,
    [values],
  );

  const erroredSections = useMemo(
    () => sectionsWithErrors(Object.keys(form.formState.errors)),
    [form.formState.errors],
  );

  const createPractitioner = useCreatePractitioner();
  const updatePractitioner = useUpdatePractitioner(practitionerId ?? '');
  const isSaving = createPractitioner.isPending || updatePractitioner.isPending;

  const handleSubmit = form.handleSubmit(
    (validValues) => {
      const backToList = () => router.push('/practitioners');

      if (isEditMode) {
        updatePractitioner.mutate(validValues, { onSuccess: backToList });
      } else {
        createPractitioner.mutate(validValues, { onSuccess: backToList });
      }
    },
    (errors) => {
      // A required field inside a collapsed section would reject the save with
      // nothing on screen to explain it, so failing sections open themselves.
      const failing = sectionsWithErrors(Object.keys(errors));
      setOpenSections((current) => [
        ...current,
        ...failing.filter((id) => !current.includes(id)),
      ]);
    },
  );

  return {
    form,
    isEditMode,
    isLoadingPractitioner,
    isSaving,
    handleSubmit,
    openSections,
    // Radix hands back plain strings; the ids are a closed set, so narrowing
    // here keeps the section type intact everywhere else.
    setOpenSections: (next: string[]) =>
      setOpenSections(next as PractitionerSectionId[]),
    summaries,
    erroredSections,
  };
}
