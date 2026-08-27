"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  clinicalServiceFormSchema,
  type ClinicalServiceFormValues,
} from "../types";
import {
  INITIAL_CLINICAL_SERVICE_FORM_VALUES,
  PRICE_FIELDS,
  toClinicalServiceFormValues,
  type ClinicalServiceFormInput,
} from "../utils/clinicalServiceFormMapping";
import {
  SECTION_FIELDS,
  sectionsWithErrors,
  summariseSection,
  type ClinicalServiceSectionId,
} from "../utils/clinicalServiceSectionSummaries";
import {
  useClinicalService,
  useCreateClinicalService,
  useUpdateClinicalService,
} from "./useClinicalServices";

const SECTION_IDS = Object.keys(SECTION_FIELDS) as ClinicalServiceSectionId[];

/** Only the first section starts open — the rest are one click away. */
const FIRST_SECTION: ClinicalServiceSectionId[] = [SECTION_IDS[0]!];

/**
 * Owns the clinical service form page: loads the service in edit mode, wires
 * react-hook-form, and submits through create or update depending on mode.
 * Also owns which sections are expanded and the recap each trigger shows.
 */
export function useClinicalServiceForm(serviceId?: string) {
  const router = useRouter();
  const isEditMode = Boolean(serviceId);
  const { data: existingService, isLoading: isLoadingService } =
    useClinicalService(serviceId);

  const form = useForm<
    ClinicalServiceFormInput,
    unknown,
    ClinicalServiceFormValues
  >({
    resolver: zodResolver(clinicalServiceFormSchema),
    defaultValues: INITIAL_CLINICAL_SERVICE_FORM_VALUES,
  });

  useEffect(() => {
    if (existingService)
      form.reset(toClinicalServiceFormValues(existingService));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingService]);

  // Switching to "on enquiry" clears every price, so a figure typed under an
  // earlier model cannot survive on a service the assistant must never quote.
  // The fields are only hidden at that point, and a hidden value still submits.
  const pricingModel = useWatch({
    control: form.control,
    name: "pricingModel",
  });
  useEffect(() => {
    if (pricingModel !== "ON_ENQUIRY") return;
    for (const field of PRICE_FIELDS) form.setValue(field, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingModel]);

  const [openSections, setOpenSections] =
    useState<ClinicalServiceSectionId[]>(FIRST_SECTION);

  // Every value, so a trigger's recap tracks what the admin is typing rather
  // than what was last saved.
  const values = useWatch({
    control: form.control,
  }) as ClinicalServiceFormInput;

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        SECTION_IDS.map((id) => [id, summariseSection(id, values)]),
      ) as Record<ClinicalServiceSectionId, string>,
    [values],
  );

  const erroredSections = useMemo(
    () => sectionsWithErrors(Object.keys(form.formState.errors)),
    [form.formState.errors],
  );

  const createService = useCreateClinicalService();
  const updateService = useUpdateClinicalService(serviceId ?? "");
  const isSaving = createService.isPending || updateService.isPending;

  const handleSubmit = form.handleSubmit(
    (validValues) => {
      const backToList = () => router.push("/clinical-services");

      if (isEditMode) {
        updateService.mutate(validValues, { onSuccess: backToList });
      } else {
        createService.mutate(validValues, { onSuccess: backToList });
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
    isLoadingService,
    isSaving,
    handleSubmit,
    openSections,
    // Radix hands back plain strings; the ids are a closed set, so narrowing
    // here keeps the section type intact everywhere else.
    setOpenSections: (next: string[]) =>
      setOpenSections(next as ClinicalServiceSectionId[]),
    summaries,
    erroredSections,
  };
}
