'use client';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Columns3, LayoutGrid, Plus } from 'lucide-react';
import { SERVICE_PLAN_PRESETS, buildPlansFromPreset } from '../data/servicePlanPresets';
import { useServicePlanEditor } from '../hooks/useServicePlanEditor';
import type { ServicePlanFormData } from '../types';
import { getPlanDisplayName } from '../utils/servicePlanSummary';
import { PlanComparisonSheet } from './PlanComparisonSheet';
import { PlanEditorDialog } from './PlanEditorDialog';
import { PlanPreviewDialog } from './PlanPreviewDialog';
import { PlanSummaryCard } from './PlanSummaryCard';

interface PlanBuilderProps {
  plans: ServicePlanFormData[];
  onChange: (plans: ServicePlanFormData[]) => void;
  currency: string;
  disabled?: boolean;
}

/** The Plans section: a summary row per tier, with the full detail behind preview, edit and
 * compare rather than every field expanded at once. */
export function PlanBuilder({ plans, onChange, currency, disabled = false }: PlanBuilderProps) {
  const planEditor = useServicePlanEditor({ plans, onChange });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--ink)]">Plans &amp; pricing</h2>
          <p className="text-xs text-[var(--ink-mute)]">
            The tiers the bot quotes when a lead asks about price.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {plans.length === 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="lg" disabled={disabled}>
                  <LayoutGrid size={14} className="mr-1.5" /> Use a preset
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>Start from a tier ladder</DropdownMenuLabel>
                {SERVICE_PLAN_PRESETS.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex flex-col items-start gap-0.5"
                    onClick={() => planEditor.applyPreset(buildPlansFromPreset(preset))}
                  >
                    <span className="text-xs font-medium">{preset.label}</span>
                    <span className="text-[11px] text-[var(--ink-mute)]">{preset.description}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {plans.length > 0 && (
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => planEditor.setComparisonOpen(true)}
            >
              <Columns3 size={14} className="mr-1.5" /> Compare
            </Button>
          )}

          <Button
            type="button"
            size="lg"
            variant="outline"
            disabled={disabled}
            onClick={planEditor.addPlan}
          >
            <Plus size={14} className="mr-1.5" /> Add plan
          </Button>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--line)] px-4 py-10 text-center">
          <p className="text-sm font-medium text-[var(--ink)]">No plans yet</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--ink-mute)]">
            Add at least one tier so the bot has a price to quote. Leave the price empty and mark it
            a custom quote when the scope decides the number.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {plans.map((plan, index) => (
            <PlanSummaryCard
              key={plan.key}
              plan={plan}
              index={index}
              planCount={plans.length}
              currency={currency}
              disabled={disabled}
              onPreview={() => planEditor.openPreview(plan.key)}
              onEdit={() => planEditor.openEditor(plan.key)}
              onDelete={() => planEditor.requestPlanDeletion(plan.key)}
              onMove={(direction) => planEditor.movePlan(index, direction)}
            />
          ))}
        </div>
      )}

      <PlanEditorDialog
        plan={planEditor.editorPlan}
        index={planEditor.editorPlanIndex}
        isAdding={planEditor.isAddingPlan}
        currency={currency}
        disabled={disabled}
        onSave={planEditor.savePlan}
        onCancel={planEditor.closeEditor}
      />

      <PlanPreviewDialog
        plan={planEditor.previewPlan}
        index={planEditor.previewPlanIndex}
        currency={currency}
        disabled={disabled}
        onEdit={planEditor.editPreviewedPlan}
        onClose={planEditor.closePreview}
      />

      <PlanComparisonSheet
        plans={plans}
        currency={currency}
        open={planEditor.isComparisonOpen}
        onOpenChange={planEditor.setComparisonOpen}
      />

      <ConfirmDialog
        open={!!planEditor.planPendingDeletion}
        onClose={planEditor.cancelPlanDeletion}
        onConfirm={planEditor.confirmPlanDeletion}
        title="Delete this plan?"
        description={
          planEditor.planPendingDeletion
            ? `${getPlanDisplayName(planEditor.planPendingDeletion, planEditor.planPendingDeletionIndex)} and everything listed under it will be removed from this service.`
            : undefined
        }
        confirmLabel="Delete plan"
      />
    </div>
  );
}
