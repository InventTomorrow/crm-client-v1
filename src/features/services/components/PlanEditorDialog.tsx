'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { EditableListField } from '@/shared/ui/EditableListField';
import { Input } from '@/shared/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Switch } from '@/shared/ui/Switch';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { BILLING_CYCLES, BILLING_CYCLE_LABELS, type ServicePlanFormData } from '../types';
import { validatePlanDraft, type PlanDraftErrors } from '../utils/servicePlanValidation';

interface PlanEditorDialogProps {
  /** The plan being edited, or null when the dialog is closed. */
  plan: ServicePlanFormData | null;
  index: number;
  currency: string;
  /** True while the tier is new — it has not joined the list yet. */
  isAdding: boolean;
  disabled?: boolean;
  onSave: (plan: ServicePlanFormData) => void;
  onCancel: () => void;
}

/** Edits one tier at a time. Changes live in a local draft and only reach the service form on
 * Save, so a new plan never appears in the list until it is saved and backing out of an edit
 * leaves the form exactly as it was. */
export function PlanEditorDialog({
  plan,
  index,
  currency,
  isAdding,
  disabled = false,
  onSave,
  onCancel,
}: PlanEditorDialogProps) {
  const [draftPlan, setDraftPlan] = useState<ServicePlanFormData | null>(plan);
  const [draftErrors, setDraftErrors] = useState<PlanDraftErrors>({});

  // Reseed when a different tier is opened. Done during render rather than in an effect so the
  // dialog never paints one frame of the previously edited plan.
  const [lastOpenedKey, setLastOpenedKey] = useState(plan?.key ?? null);
  if ((plan?.key ?? null) !== lastOpenedKey) {
    setLastOpenedKey(plan?.key ?? null);
    setDraftPlan(plan);
    setDraftErrors({});
  }

  if (!draftPlan) return null;

  function updateDraft(patch: Partial<ServicePlanFormData>) {
    setDraftPlan((current) => (current ? { ...current, ...patch } : current));
  }

  /** Only closes once the plan is actually in the list — an invalid draft keeps the dialog open. */
  function handleSave() {
    if (!draftPlan) return;
    const errors = validatePlanDraft(draftPlan);
    setDraftErrors(errors);
    if (Object.keys(errors).length > 0) return;
    onSave({ ...draftPlan, name: draftPlan.name.trim() });
  }

  return (
    <Dialog open={!!plan} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent
        className="sm:max-w-lg"
        // Half-typed tiers are easy to lose — leaving takes Cancel, Escape or the close button.
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {isAdding ? `New tier ${index + 1}` : draftPlan.name.trim() || `Tier ${index + 1}`}
          </DialogTitle>
          <DialogDescription>
            What the bot quotes for this tier when a lead asks about price.
          </DialogDescription>
        </DialogHeader>

        <div className="scroll-themed flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--ink-soft)]">Plan name</label>
            <Input
              placeholder="Plan name (e.g. Growth)"
              value={draftPlan.name}
              disabled={disabled}
              aria-invalid={!!draftErrors.name}
              onChange={(event) => updateDraft({ name: event.target.value })}
            />
            {draftErrors.name && (
              <p className="text-[11px] text-destructive">{draftErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--ink-soft)]">
                Price {draftPlan.isCustomQuote && <span className="opacity-60">(quoted)</span>}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[var(--ink-mute)]">
                  {currency}
                </span>
                <Input
                  type="number"
                  inputMode="numeric"
                  className="pl-11"
                  placeholder={draftPlan.isCustomQuote ? 'On request' : '25000'}
                  disabled={disabled || draftPlan.isCustomQuote}
                  aria-invalid={!!draftErrors.price}
                  value={draftPlan.price ?? ''}
                  onChange={(event) =>
                    updateDraft({
                      price: event.target.value === '' ? null : Number(event.target.value),
                    })
                  }
                />
              </div>
              {draftErrors.price && (
                <p className="text-[11px] text-destructive">{draftErrors.price}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--ink-soft)]">Billing cycle</label>
              {/* Radix Select rather than the autocomplete used elsewhere — its popup stays inside
                  the dialog's modal layer, where a body-portalled one would be click-blocked. */}
              <Select
                value={draftPlan.billingCycle}
                disabled={disabled}
                onValueChange={(billingCycle) =>
                  updateDraft({ billingCycle: billingCycle as ServicePlanFormData['billingCycle'] })
                }
              >
                <SelectTrigger size="lg" className="w-full">
                  <SelectValue placeholder="Select billing cycle…" />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((cycle) => (
                    <SelectItem key={cycle} value={cycle}>
                      {BILLING_CYCLE_LABELS[cycle]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--ink-soft)]">
                Min. contract (months)
              </label>
              <Input
                type="number"
                min={0}
                value={draftPlan.minContractMonths}
                disabled={disabled}
                onChange={(event) => updateDraft({ minContractMonths: Number(event.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--ink-soft)]">Best for</label>
              <Input
                placeholder="e.g. Small businesses"
                value={draftPlan.bestFor ?? ''}
                disabled={disabled}
                onChange={(event) => updateDraft({ bestFor: event.target.value })}
              />
            </div>
          </div>

          <div className="h-px bg-[var(--line)]" />

          <EditableListField
            label="What's included"
            values={draftPlan.features}
            onChange={(features) => updateDraft({ features })}
            placeholder="e.g. 12 posts per month"
            addLabel="Add feature"
            emptyHint="No features yet — list what the client actually receives."
            disabled={disabled}
            showOrderHandle
          />

          <div className="h-px bg-[var(--line)]" />

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--ink-soft)]">
              <Switch
                checked={draftPlan.isHighlighted}
                disabled={disabled}
                onCheckedChange={(checked) => updateDraft({ isHighlighted: checked })}
              />
              <span className="flex items-center gap-1">
                <Star
                  size={12}
                  className={
                    draftPlan.isHighlighted ? 'text-[var(--accent)]' : 'text-[var(--ink-mute)]'
                  }
                  fill={draftPlan.isHighlighted ? 'currentColor' : 'none'}
                />
                Recommended
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--ink-soft)]">
              <Switch
                checked={draftPlan.isCustomQuote}
                disabled={disabled}
                onCheckedChange={(checked) =>
                  updateDraft({ isCustomQuote: checked, price: checked ? null : draftPlan.price })
                }
              />
              Custom quote
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="lg" disabled={disabled} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" size="lg" disabled={disabled} onClick={handleSave}>
            {isAdding ? 'Add plan' : 'Save plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
