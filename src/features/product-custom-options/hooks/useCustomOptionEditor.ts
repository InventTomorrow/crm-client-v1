"use client";
import { useCallback, useMemo, useState } from "react";
import {
  useCreateCustomOption,
  useCustomOptionUsage,
  useDeleteCustomOption,
  useProductCustomOptions,
  useUpdateCustomOption,
} from "./useProductCustomOptions";
import {
  customOptionFormSchema,
  isChoiceType,
  toAnswerType,
  toInputType,
  toPricingMode,
  type AnswerType,
  type CustomOptionFormData,
  type PricingMode,
  type ProductCustomOption,
} from "../types";

/** A blank option: free text, no surcharge, optional. */
export const EMPTY_DRAFT: CustomOptionFormData = {
  label: "",
  inputType: "TEXT",
  choices: [],
  isRequired: false,
  priceDelta: 0,
  priceAdjustmentType: "FIXED",
  requiresQuote: false,
  consumesStock: true,
  minQuantity: 1,
};

function toDraft(option: ProductCustomOption): CustomOptionFormData {
  return {
    label: option.label,
    ...(option.helpText ? { helpText: option.helpText } : {}),
    inputType: option.inputType,
    choices: option.choices,
    isRequired: option.isRequired,
    priceDelta: option.priceDelta,
    priceAdjustmentType: option.priceAdjustmentType,
    requiresQuote: option.requiresQuote,
    ...(option.leadTimeDays !== null ? { leadTimeDays: option.leadTimeDays } : {}),
    consumesStock: option.consumesStock,
    minQuantity: option.minQuantity,
  };
}

/**
 * Owns the shared option pool and the one draft being edited.
 *
 * The pool belongs to the workspace, so every edit here changes what the
 * assistant asks on every product that offers the option — the delete dialog
 * spells that out before it happens.
 */
export function useCustomOptionEditor() {
  const { data: options = [], isLoading } = useProductCustomOptions();
  const createOption = useCreateCustomOption();
  const updateOption = useUpdateCustomOption();
  const deleteOption = useDeleteCustomOption();

  /** null = panel closed; a string id = editing that option; "new" = adding. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CustomOptionFormData>(EMPTY_DRAFT);
  // Held rather than derived: "Costs extra" must stay picked while the amount
  // is still empty, which a derivation from priceDelta alone would undo.
  const [pricingMode, setPricingModeState] = useState<PricingMode>("FREE");
  const [optionPendingDeletion, setOptionPendingDeletion] =
    useState<ProductCustomOption | null>(null);

  const { data: productsOffering = [] } = useCustomOptionUsage(
    optionPendingDeletion?.id,
  );

  const startAdding = useCallback(() => {
    setDraft(EMPTY_DRAFT);
    setPricingModeState("FREE");
    setEditingId("new");
  }, []);

  const startEditing = useCallback((option: ProductCustomOption) => {
    setDraft(toDraft(option));
    setPricingModeState(toPricingMode(option));
    setEditingId(option.id);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setPricingModeState("FREE");
  }, []);

  const patchDraft = useCallback((patch: Partial<CustomOptionFormData>) => {
    setDraft((current) => {
      const next = { ...current, ...patch };
      // Switching away from a choice type leaves its choices behind as noise the
      // validator would then reject on a later switch back.
      if (patch.inputType && !isChoiceType(patch.inputType)) next.choices = [];
      return next;
    });
  }, []);

  const answerType = toAnswerType(draft.inputType);
  const allowsMultiple = draft.inputType === "MULTI_CHOICE";

  const setAnswerType = useCallback(
    (next: AnswerType) => patchDraft({ inputType: toInputType(next, false) }),
    [patchDraft],
  );

  const setAllowsMultiple = useCallback(
    (next: boolean) => patchDraft({ inputType: toInputType("CHOICE", next) }),
    [patchDraft],
  );

  /** Clearing every price on FREE/QUOTE keeps the row's badge honest. */
  const setPricingMode = useCallback(
    (next: PricingMode) => {
      setPricingModeState(next);
      setDraft((current) => {
        const cleared = next !== "EXTRA";
        return {
          ...current,
          requiresQuote: next === "QUOTE",
          priceAdjustmentType: "FIXED",
          priceDelta: cleared ? 0 : current.priceDelta,
          choices: current.choices.map((choice) => ({
            ...choice,
            priceAdjustmentType: "FIXED" as const,
            priceDelta: cleared ? 0 : choice.priceDelta,
          })),
        };
      });
    },
    [],
  );

  const draftErrors = useMemo(() => {
    const parsed = customOptionFormSchema.safeParse(draft);
    if (parsed.success) return {} as Record<string, string>;
    return Object.fromEntries(
      parsed.error.issues.map((issue) => [
        String(issue.path[0] ?? "form"),
        issue.message,
      ]),
    );
  }, [draft]);

  const isDraftValid = Object.keys(draftErrors).length === 0;

  /** Returns the saved option so a caller can tick it on the product it was added from. */
  const submitDraft = useCallback(async (): Promise<ProductCustomOption | null> => {
    const parsed = customOptionFormSchema.safeParse(draft);
    if (!parsed.success) return null;

    const saved =
      editingId && editingId !== "new"
        ? await updateOption
            .mutateAsync({ optionId: editingId, payload: parsed.data })
            .catch(() => null)
        : await createOption.mutateAsync(parsed.data).catch(() => null);

    if (saved) cancelEditing();
    return saved;
  }, [draft, editingId, createOption, updateOption, cancelEditing]);

  const setIsActive = useCallback(
    (option: ProductCustomOption, isActive: boolean) => {
      updateOption.mutate({ optionId: option.id, payload: { isActive } });
    },
    [updateOption],
  );

  const confirmDeletion = useCallback(() => {
    if (!optionPendingDeletion) return;
    deleteOption.mutate(optionPendingDeletion.id, {
      onSettled: () => setOptionPendingDeletion(null),
    });
  }, [optionPendingDeletion, deleteOption]);

  return {
    options,
    isLoading,
    editingId,
    isAdding: editingId === "new",
    draft,
    draftErrors,
    isDraftValid,
    patchDraft,
    answerType,
    setAnswerType,
    allowsMultiple,
    setAllowsMultiple,
    pricingMode,
    setPricingMode,
    startAdding,
    startEditing,
    cancelEditing,
    submitDraft,
    setIsActive,
    optionPendingDeletion,
    setOptionPendingDeletion,
    productsOffering,
    confirmDeletion,
    isSubmitting: createOption.isPending || updateOption.isPending,
    isDeleting: deleteOption.isPending,
  };
}
