"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { UpdateClinicalServicePayload } from "../services/clinicalServicesService";
import { useClinicalServiceDraftStore } from "../stores/clinicalServiceDraftStore";
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
  useCreateClinicalServiceDraft,
  useSaveClinicalServiceStep,
} from "./useClinicalServices";

/**
 * Visibility comes last: it is the step that decides whether the assistant may
 * volunteer this service, and a draft stays unlisted until the admin gets there.
 */
export const CLINICAL_SERVICE_STEP_ORDER: ClinicalServiceSectionId[] = [
  "basics",
  "scope",
  "intake",
  "pricing",
  "terms",
  "safety",
  "visibility",
];

const LAST_STEP_INDEX = CLINICAL_SERVICE_STEP_ORDER.length - 1;

/**
 * Forced onto the row created at step one.
 *
 * Every assistant read path filters on `isActive` and `isPubliclyListed`, so an
 * unfinished draft cannot be quoted to a family before its scope, pricing and
 * safety steps have been filled in.
 */
const DRAFT_SAFETY_OVERRIDES = {
  isActive: false,
  isPubliclyListed: false,
} as const;

/** The subset of a step's own fields, for a PATCH that touches nothing else. */
function pickStepFields(
  values: ClinicalServiceFormValues,
  stepId: ClinicalServiceSectionId,
): UpdateClinicalServicePayload {
  const payload: Record<string, unknown> = {};
  for (const field of SECTION_FIELDS[stepId]) payload[field] = values[field];
  return payload as UpdateClinicalServicePayload;
}

type CommitResult = { ok: false } | { ok: true; createdId?: string };

/**
 * Drives the clinical service form as an ordered wizard.
 *
 * Step one writes a real (but inactive and unlisted) row and the wizard then
 * continues on that record's edit route, so an abandoned form is finished later
 * by editing the service it already created. Every later step patches only its
 * own fields, optimistically: the admin moves on immediately and a failure
 * sends them back to the step that did not stick.
 */
export function useClinicalServiceWizard(serviceId?: string) {
  const router = useRouter();
  const isEditRoute = Boolean(serviceId);
  const { data: existingService, isLoading: isLoadingService } =
    useClinicalService(serviceId);

  const draftId = useClinicalServiceDraftStore((state) => state.draftId);
  const setDraft = useClinicalServiceDraftStore((state) => state.setDraft);
  const resetDraft = useClinicalServiceDraftStore((state) => state.reset);

  /**
   * True only while the wizard is still filling in the row it created itself.
   *
   * The stored step position belongs to that record alone, so opening "Add
   * service" or editing any other service ignores it and starts at step one —
   * no reset needed, and no stale position on the first paint.
   */
  const isDraftInProgress =
    draftId !== null && draftId === (serviceId ?? null);
  const isCreating = !isEditRoute || isDraftInProgress;

  const form = useForm<
    ClinicalServiceFormInput,
    unknown,
    ClinicalServiceFormValues
  >({
    resolver: zodResolver(clinicalServiceFormSchema),
    defaultValues: INITIAL_CLINICAL_SERVICE_FORM_VALUES,
  });

  /**
   * Seeded once per record. Every step save invalidates the service queries, so
   * re-seeding on each refetch would wipe whatever the admin is part-way
   * through typing on the current step.
   */
  const seededRecordId = useRef<string | null>(null);
  useEffect(() => {
    if (!existingService) return;
    if (seededRecordId.current === existingService.id) return;
    seededRecordId.current = existingService.id;

    const seeded = toClinicalServiceFormValues(existingService);
    // A draft was forced inactive and unlisted so the assistant could not reach
    // it midway; the visibility step should still open on the defaults the
    // admin expects.
    form.reset(
      isDraftInProgress
        ? {
            ...seeded,
            isActive: INITIAL_CLINICAL_SERVICE_FORM_VALUES.isActive,
            isPubliclyListed:
              INITIAL_CLINICAL_SERVICE_FORM_VALUES.isPubliclyListed,
          }
        : seeded,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingService]);

  // Switching to "on enquiry" clears every price, so a figure typed under an
  // earlier model cannot survive on a service the assistant must never quote.
  const pricingModel = useWatch({ control: form.control, name: "pricingModel" });
  useEffect(() => {
    if (pricingModel !== "ON_ENQUIRY") return;
    for (const field of PRICE_FIELDS) form.setValue(field, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingModel]);

  // Every value, so the rail's recap tracks what is being typed rather than
  // what was last saved.
  const values = useWatch({
    control: form.control,
  }) as ClinicalServiceFormInput;

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        CLINICAL_SERVICE_STEP_ORDER.map((id) => [
          id,
          summariseSection(id, values),
        ]),
      ) as Record<ClinicalServiceSectionId, string>,
    [values],
  );

  const erroredSections = useMemo(
    () => sectionsWithErrors(Object.keys(form.formState.errors)),
    [form.formState.errors],
  );

  /**
   * Seeded from the hand-off so a wizard that has just created its row resumes
   * on the next step. The store is in-memory, so this reads the same on the
   * server as on the client and a reload simply starts at step one.
   */
  const [stepIndex, setStepIndex] = useState(() => {
    const draft = useClinicalServiceDraftStore.getState();
    return serviceId && draft.draftId === serviceId ? draft.stepIndex : 0;
  });

  /**
   * Only "Add service" gates the steps, and it never gets past the first one:
   * step one creates the row and hands over to its edit route. From there the
   * record exists and every step saves on its own, so all are reachable.
   */
  const furthestStepIndex = isEditRoute ? LAST_STEP_INDEX : 0;

  /** Moves the wizard, keeping the hand-off in step with it. */
  const moveToStep = useCallback(
    (nextStepIndex: number) => {
      setStepIndex(nextStepIndex);
      const currentDraftId = useClinicalServiceDraftStore.getState().draftId;
      if (currentDraftId) setDraft(currentDraftId, nextStepIndex);
    },
    [setDraft],
  );

  const createDraft = useCreateClinicalServiceDraft();
  const targetId = serviceId ?? draftId;
  const saveStep = useSaveClinicalServiceStep(targetId ?? "");
  const isSaving = createDraft.isPending || saveStep.isPending;

  const backToList = useCallback(() => {
    resetDraft();
    router.push("/clinical-services");
  }, [resetDraft, router]);

  /**
   * Surfaces a cross-field rule that fired outside the current step — the
   * pricing refinements do exactly this — and moves to the step that owns it,
   * so the message is never reported off-screen.
   */
  const revealFailingStep = useCallback(
    async (failedFields: string[]) => {
      await form.trigger();
      const [failingSection] = sectionsWithErrors(failedFields);
      if (!failingSection) return;

      const failingIndex = CLINICAL_SERVICE_STEP_ORDER.indexOf(failingSection);
      if (failingIndex >= 0) moveToStep(failingIndex);
    },
    [form, moveToStep],
  );

  /**
   * Validates the step being left and persists it.
   *
   * `blockOnInvalid` is false when stepping backwards: a half-filled step must
   * not trap the admin on it, it just does not get saved.
   */
  const commitCurrentStep = useCallback(
    async (blockOnInvalid: boolean): Promise<CommitResult> => {
      const stepId = CLINICAL_SERVICE_STEP_ORDER[stepIndex]!;
      const isStepValid = await form.trigger(SECTION_FIELDS[stepId]);
      if (!isStepValid) return blockOnInvalid ? { ok: false } : { ok: true };

      const parsed = clinicalServiceFormSchema.safeParse(form.getValues());
      if (!parsed.success) {
        if (!blockOnInvalid) return { ok: true };
        await revealFailingStep(
          parsed.error.issues.map((issue) => String(issue.path[0])),
        );
        return { ok: false };
      }

      if (!targetId) {
        // Step one of a create: the row has to exist before anything can patch
        // it, so this is the one save the admin waits on.
        const created = await createDraft.mutateAsync({
          ...parsed.data,
          ...DRAFT_SAFETY_OVERRIDES,
        });
        // Already on screen — stops the seed effect resetting the form when
        // this record lands in the cache.
        seededRecordId.current = created.id;
        setDraft(created.id, stepIndex + 1);
        return { ok: true, createdId: created.id };
      }

      saveStep.mutate(pickStepFields(parsed.data, stepId));
      return { ok: true };
    },
    [
      stepIndex,
      form,
      targetId,
      createDraft,
      setDraft,
      saveStep,
      revealFailingStep,
    ],
  );

  const goToStep = useCallback(
    async (nextStepIndex: number) => {
      if (nextStepIndex === stepIndex) return;
      if (nextStepIndex > furthestStepIndex) return;

      const movingForward = nextStepIndex > stepIndex;
      const result = await commitCurrentStep(movingForward);
      if (result.ok) moveToStep(nextStepIndex);
    },
    [stepIndex, furthestStepIndex, commitCurrentStep, moveToStep],
  );

  const goBack = useCallback(() => {
    if (stepIndex > 0) void goToStep(stepIndex - 1);
  }, [stepIndex, goToStep]);

  /** The final step writes the whole form, so a rail jump cannot leave a gap. */
  const submitAll = useCallback(async () => {
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      await revealFailingStep(Object.keys(form.formState.errors));
      return;
    }

    const parsed = clinicalServiceFormSchema.safeParse(form.getValues());
    if (!parsed.success) {
      await revealFailingStep(
        parsed.error.issues.map((issue) => String(issue.path[0])),
      );
      return;
    }

    if (!targetId) return;

    await saveStep.mutateAsync(parsed.data);
    toast.success(isCreating ? "Service added" : "Service updated");
    backToList();
  }, [form, targetId, saveStep, isCreating, backToList, revealFailingStep]);

  const goNext = useCallback(async () => {
    if (stepIndex === LAST_STEP_INDEX) {
      await submitAll();
      return;
    }

    const result = await commitCurrentStep(true);
    if (!result.ok) return;

    moveToStep(stepIndex + 1);
    // The row now exists, so the wizard carries on against it: a reload lands
    // on the saved draft, and an abandoned one is finished from the list.
    if (result.createdId) {
      router.replace(`/clinical-services/${result.createdId}/edit`);
    }
  }, [stepIndex, submitAll, commitCurrentStep, moveToStep, router]);

  const savedLabel = useMemo(() => {
    if (isSaving) return "Saving…";
    if (targetId) return "Saved";
    return null;
  }, [isSaving, targetId]);

  return {
    form,
    isCreating,
    isLoadingService: isEditRoute && !isDraftInProgress && isLoadingService,
    isSaving,
    stepIndex,
    furthestStepIndex,
    summaries,
    erroredSections,
    goToStep,
    goBack,
    goNext,
    backToList,
    savedLabel,
  };
}
