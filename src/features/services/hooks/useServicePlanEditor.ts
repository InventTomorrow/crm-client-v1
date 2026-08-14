'use client';
import { useState } from 'react';
import type { ServicePlanFormData } from '../types';
import { buildEmptyPlan } from '../utils/serviceFormMapping';

interface UseServicePlanEditorOptions {
  plans: ServicePlanFormData[];
  onChange: (plans: ServicePlanFormData[]) => void;
}

/** Owns which plan is open in the editor, which one is being previewed, which one is awaiting
 * delete confirmation, and whether the comparison sheet is up.
 *
 * A plan being added lives in `newPlanDraft` and only joins `plans` on save, so an abandoned
 * dialog never leaves a blank tier on the page. Saved plans are tracked by `key` rather than
 * index so reordering or deleting another tier cannot repoint an open dialog. */
export function useServicePlanEditor({ plans, onChange }: UseServicePlanEditorOptions) {
  const [newPlanDraft, setNewPlanDraft] = useState<ServicePlanFormData | null>(null);
  const [editingPlanKey, setEditingPlanKey] = useState<string | null>(null);
  const [previewPlanKey, setPreviewPlanKey] = useState<string | null>(null);
  const [planKeyPendingDeletion, setPlanKeyPendingDeletion] = useState<string | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const editingPlanIndex = plans.findIndex((plan) => plan.key === editingPlanKey);
  const previewPlanIndex = plans.findIndex((plan) => plan.key === previewPlanKey);
  const savedEditingPlan = editingPlanIndex === -1 ? null : plans[editingPlanIndex];

  // A new tier sits at the end of the ladder, which is where it will land once saved.
  const editorPlan = newPlanDraft ?? savedEditingPlan;
  const editorPlanIndex = newPlanDraft ? plans.length : editingPlanIndex;
  const isAddingPlan = !!newPlanDraft;

  const previewPlan = previewPlanIndex === -1 ? null : plans[previewPlanIndex];
  const planPendingDeletion =
    plans.find((plan) => plan.key === planKeyPendingDeletion) ?? null;
  const planPendingDeletionIndex = plans.findIndex(
    (plan) => plan.key === planKeyPendingDeletion,
  );

  function reindex(nextPlans: ServicePlanFormData[]) {
    return nextPlans.map((plan, index) => ({ ...plan, displayOrder: index }));
  }

  function addPlan() {
    setNewPlanDraft(buildEmptyPlan(plans.length));
  }

  function applyPreset(presetPlans: ServicePlanFormData[]) {
    onChange(reindex(presetPlans));
  }

  function closeEditor() {
    setNewPlanDraft(null);
    setEditingPlanKey(null);
  }

  /** Commits the dialog's draft — appending it for a new tier, replacing it for an existing one. */
  function savePlan(savedPlan: ServicePlanFormData) {
    if (newPlanDraft && savedPlan.key === newPlanDraft.key) {
      onChange(reindex([...plans, savedPlan]));
    } else {
      onChange(plans.map((plan) => (plan.key === savedPlan.key ? savedPlan : plan)));
    }
    closeEditor();
  }

  function confirmPlanDeletion() {
    if (planPendingDeletionIndex === -1) return;
    onChange(reindex(plans.filter((_, index) => index !== planPendingDeletionIndex)));
    if (planKeyPendingDeletion === editingPlanKey) setEditingPlanKey(null);
    if (planKeyPendingDeletion === previewPlanKey) setPreviewPlanKey(null);
    setPlanKeyPendingDeletion(null);
  }

  function movePlan(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= plans.length) return;
    const nextPlans = [...plans];
    [nextPlans[index], nextPlans[swapIndex]] = [nextPlans[swapIndex], nextPlans[index]];
    onChange(reindex(nextPlans));
  }

  /** Preview hands off to the editor without leaving both dialogs stacked. */
  function editPreviewedPlan() {
    setEditingPlanKey(previewPlanKey);
    setPreviewPlanKey(null);
  }

  return {
    editorPlan,
    editorPlanIndex,
    isAddingPlan,
    previewPlan,
    previewPlanIndex,
    planPendingDeletion,
    planPendingDeletionIndex,
    isComparisonOpen,
    openEditor: setEditingPlanKey,
    closeEditor,
    openPreview: setPreviewPlanKey,
    closePreview: () => setPreviewPlanKey(null),
    requestPlanDeletion: setPlanKeyPendingDeletion,
    cancelPlanDeletion: () => setPlanKeyPendingDeletion(null),
    confirmPlanDeletion,
    setComparisonOpen: setIsComparisonOpen,
    addPlan,
    applyPreset,
    savePlan,
    movePlan,
    editPreviewedPlan,
  };
}
