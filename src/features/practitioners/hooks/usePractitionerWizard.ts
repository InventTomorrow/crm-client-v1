"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import type { UpdatePractitionerPayload } from "../services/practitionersService";
import { usePractitionerDraftStore } from "../stores/practitionerDraftStore";
import { practitionerFormSchema, type PractitionerFormValues } from "../types";
import {
  INITIAL_PRACTITIONER_FORM_VALUES,
  toPractitionerFormValues,
  type PractitionerFormInput,
} from "../utils/practitionerFormMapping";
import {
  SECTION_FIELDS,
  sectionsWithErrors,
  summariseSection,
  type PractitionerSectionId,
} from "../utils/practitionerSectionSummaries";
import {
  useCreatePractitionerDraft,
  usePractitioner,
  useSavePractitionerStep,
} from "./usePractitioners";

/**
 * Visibility comes last: it is the step that decides whether the assistant may
 * name this person, and a draft stays inactive until the admin gets there.
 */
export const PRACTITIONER_STEP_ORDER: PractitionerSectionId[] = [
  "identity",
  "expertise",
  "profile",
  "schedule",
  "visibility",
];

const LAST_STEP_INDEX = PRACTITIONER_STEP_ORDER.length - 1;

/**
 * Forced onto the row created at step one.
 *
 * Every assistant read path filters on `isActive`, so an unfinished draft is
 * unreachable by patients until the visibility step commits the real choice.
 */
const DRAFT_SAFETY_OVERRIDES = { isActive: false } as const;

/** The subset of a step's own fields, for a PATCH that touches nothing else. */
function pickStepFields(
  values: PractitionerFormValues,
  stepId: PractitionerSectionId,
): UpdatePractitionerPayload {
  const payload: Record<string, unknown> = {};
  for (const field of SECTION_FIELDS[stepId]) payload[field] = values[field];
  return payload as UpdatePractitionerPayload;
}

type CommitResult = { ok: false } | { ok: true; createdId?: string };

/**
 * Drives the practitioner form as an ordered wizard.
 *
 * Step one writes a real (but inactive) row and the wizard then continues on
 * that record's edit route, so an abandoned form is finished later by editing
 * the practitioner it already created. Every later step patches only its own
 * fields, optimistically: the admin moves on immediately and a failure sends
 * them back to the step that did not stick.
 */
export function usePractitionerWizard(practitionerId?: string) {
  const router = useRouter();
  const isEditRoute = Boolean(practitionerId);
  const { data: existingPractitioner, isLoading: isLoadingPractitioner } =
    usePractitioner(practitionerId);

  const draftId = usePractitionerDraftStore((state) => state.draftId);
  const setDraft = usePractitionerDraftStore((state) => state.setDraft);
  const resetDraft = usePractitionerDraftStore((state) => state.reset);

  /**
   * True only while the wizard is still filling in the row it created itself.
   *
   * The stored step position belongs to that record alone, so opening "Add
   * practitioner" or editing any other practitioner ignores it and starts at
   * step one — no reset needed, and no stale position on the first paint.
   */
  const isDraftInProgress =
    draftId !== null && draftId === (practitionerId ?? null);
  const isCreating = !isEditRoute || isDraftInProgress;

  const form = useForm<PractitionerFormInput, unknown, PractitionerFormValues>({
    resolver: zodResolver(practitionerFormSchema),
    defaultValues: INITIAL_PRACTITIONER_FORM_VALUES,
  });

  /**
   * Seeded once per record. Every step save invalidates the practitioner
   * queries, so re-seeding on each refetch would wipe whatever the admin is
   * part-way through typing on the current step.
   */
  const seededRecordId = useRef<string | null>(null);
  useEffect(() => {
    if (!existingPractitioner) return;
    if (seededRecordId.current === existingPractitioner.id) return;
    seededRecordId.current = existingPractitioner.id;

    const seeded = toPractitionerFormValues(existingPractitioner);
    // A draft was forced inactive so the assistant could not reach it midway;
    // the visibility step should still open on the default the admin expects.
    form.reset(
      isDraftInProgress
        ? { ...seeded, isActive: INITIAL_PRACTITIONER_FORM_VALUES.isActive }
        : seeded,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPractitioner]);

  // Every value, so the rail's recap tracks what is being typed rather than
  // what was last saved.
  const values = useWatch({ control: form.control }) as PractitionerFormInput;

  const summaries = useMemo(
    () =>
      Object.fromEntries(
        PRACTITIONER_STEP_ORDER.map((id) => [id, summariseSection(id, values)]),
      ) as Record<PractitionerSectionId, string>,
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
    const draft = usePractitionerDraftStore.getState();
    return practitionerId && draft.draftId === practitionerId ? draft.stepIndex : 0;
  });

  /**
   * Only "Add practitioner" gates the steps, and it never gets past the first
   * one: step one creates the row and hands over to its edit route. From there
   * the record exists and every step saves on its own, so all are reachable.
   */
  const furthestStepIndex = isEditRoute ? LAST_STEP_INDEX : 0;

  /** Moves the wizard, keeping the hand-off in step with it. */
  const moveToStep = useCallback(
    (nextStepIndex: number) => {
      setStepIndex(nextStepIndex);
      const currentDraftId = usePractitionerDraftStore.getState().draftId;
      if (currentDraftId) setDraft(currentDraftId, nextStepIndex);
    },
    [setDraft],
  );

  const createDraft = useCreatePractitionerDraft();
  const targetId = practitionerId ?? draftId;
  const saveStep = useSavePractitionerStep(targetId ?? "");
  const isSaving = createDraft.isPending || saveStep.isPending;

  const backToList = useCallback(() => {
    resetDraft();
    router.push("/practitioners");
  }, [resetDraft, router]);

  /**
   * Surfaces a cross-field rule that fired outside the current step and moves
   * to the step that owns it, so the message is never reported off-screen.
   */
  const revealFailingStep = useCallback(
    async (failedFields: string[]) => {
      await form.trigger();
      const [failingSection] = sectionsWithErrors(failedFields);
      if (!failingSection) return;

      const failingIndex = PRACTITIONER_STEP_ORDER.indexOf(failingSection);
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
      const stepId = PRACTITIONER_STEP_ORDER[stepIndex]!;
      const isStepValid = await form.trigger(SECTION_FIELDS[stepId]);
      if (!isStepValid) return blockOnInvalid ? { ok: false } : { ok: true };

      const parsed = practitionerFormSchema.safeParse(form.getValues());
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

    const parsed = practitionerFormSchema.safeParse(form.getValues());
    if (!parsed.success) {
      await revealFailingStep(
        parsed.error.issues.map((issue) => String(issue.path[0])),
      );
      return;
    }

    if (!targetId) return;

    await saveStep.mutateAsync(parsed.data);
    toast.success(isCreating ? "Practitioner added" : "Practitioner updated");
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
      router.replace(`/practitioners/${result.createdId}/edit`);
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
    isLoadingPractitioner: isEditRoute && !isDraftInProgress && isLoadingPractitioner,
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
