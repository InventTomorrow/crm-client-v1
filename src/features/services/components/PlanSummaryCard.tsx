'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ChevronDown, ChevronUp, Pencil, Star, Trash2 } from 'lucide-react';
import type { ServicePlanFormData } from '../types';
import {
  countPlanFeatures,
  formatPlanBillingCycle,
  formatPlanCommitment,
  formatPlanPrice,
  getPlanDisplayName,
} from '../utils/servicePlanSummary';

interface PlanSummaryCardProps {
  plan: ServicePlanFormData;
  index: number;
  planCount: number;
  currency: string;
  disabled?: boolean;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: 'up' | 'down') => void;
}

/** One row per tier in the Plans section — enough to recognise the plan at a glance, with the
 * full detail one click away in the preview and editing behind its own button. */
export function PlanSummaryCard({
  plan,
  index,
  planCount,
  currency,
  disabled = false,
  onPreview,
  onEdit,
  onDelete,
  onMove,
}: PlanSummaryCardProps) {
  const featureCount = countPlanFeatures(plan);
  const commitment = formatPlanCommitment(plan);

  return (
    <article
      className={cn(
        'flex items-center gap-2 rounded-xl border bg-[var(--surface-2)] p-3 transition-colors',
        plan.isHighlighted
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
          : 'border-[var(--line)]',
      )}
    >
      <div className="flex shrink-0 flex-col gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Move plan up"
          disabled={disabled || index === 0}
          onClick={() => onMove('up')}
        >
          <ChevronUp size={12} />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Move plan down"
          disabled={disabled || index === planCount - 1}
          onClick={() => onMove('down')}
        >
          <ChevronDown size={12} />
        </Button>
      </div>

      {/* The body itself opens the preview — editing stays on its own button beside it. */}
      <button
        type="button"
        onClick={onPreview}
        className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
            Tier {index + 1}
          </span>
          {plan.isHighlighted && (
            <Star size={11} className="text-[var(--accent)]" fill="currentColor" />
          )}
        </span>
        <span className="truncate text-sm font-medium text-[var(--ink)]">
          {getPlanDisplayName(plan, index)}
        </span>
        <span className="truncate text-[11.5px] text-[var(--ink-mute)]">
          {formatPlanPrice(plan, currency)} · {formatPlanBillingCycle(plan)}
          {commitment && ` · ${commitment}`} · {featureCount} feature
          {featureCount === 1 ? '' : 's'}
        </span>
      </button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${getPlanDisplayName(plan, index)}`}
        className="shrink-0 text-[var(--ink-mute)] hover:text-[var(--accent)]"
        disabled={disabled}
        onClick={onEdit}
      >
        <Pencil size={14} />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${getPlanDisplayName(plan, index)}`}
        className="shrink-0 text-[var(--ink-mute)] hover:text-destructive"
        disabled={disabled}
        onClick={onDelete}
      >
        <Trash2 size={14} />
      </Button>
    </article>
  );
}
