'use client';
import { cn } from '@/lib/utils';
import { Check, Star } from 'lucide-react';
import type { ServicePlanFormData } from '../types';
import {
  countPlanFeatures,
  formatPlanBillingCycle,
  formatPlanCommitment,
  formatPlanPrice,
  getPlanDisplayName,
} from '../utils/servicePlanSummary';

interface PlanPreviewCardProps {
  plan: ServicePlanFormData;
  index: number;
  currency: string;
  /** Fills the slide height in the comparison carousel; left off for the single preview. */
  fillHeight?: boolean;
  className?: string;
}

/** Read-only rendering of a plan, close to how a lead would hear it quoted. Shared by the single
 * preview and the comparison carousel so both can never drift apart. */
export function PlanPreviewCard({
  plan,
  index,
  currency,
  fillHeight = false,
  className,
}: PlanPreviewCardProps) {
  const commitment = formatPlanCommitment(plan);
  const features = plan.features.filter((feature) => feature.trim().length > 0);

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-[var(--surface-2)] p-5',
        plan.isHighlighted
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/30'
          : 'border-[var(--line)]',
        fillHeight && 'h-full',
        className,
      )}
    >
      <header className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
            Tier {index + 1}
          </span>
          {plan.isHighlighted && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--accent)]">
              <Star size={10} fill="currentColor" /> Recommended
            </span>
          )}
        </div>

        <h3 className="truncate text-[15px] font-semibold text-[var(--ink)]">
          {getPlanDisplayName(plan, index)}
        </h3>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[19px] font-semibold text-[var(--ink)]">
            {formatPlanPrice(plan, currency)}
          </span>
          <span className="text-[11px] text-[var(--ink-mute)]">
            {formatPlanBillingCycle(plan)}
            {commitment && ` · ${commitment}`}
          </span>
        </div>

        {plan.bestFor?.trim() && (
          <p className="text-[11.5px] text-[var(--ink-soft)]">Best for {plan.bestFor.trim()}</p>
        )}
      </header>

      <div className="h-px bg-[var(--line)]" />

      <div className={cn('flex flex-col gap-2', fillHeight && 'min-h-0 flex-1')}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--ink-soft)]">What&apos;s included</span>
          {features.length > 0 && (
            <span className="text-[11px] text-[var(--ink-mute)]">{countPlanFeatures(plan)}</span>
          )}
        </div>

        {features.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-center text-[11px] text-[var(--ink-mute)]">
            Nothing listed yet — the bot has no deliverables to read out for this tier.
          </p>
        ) : (
          // Long ladders scroll inside the card rather than stretching the slide past the sheet.
          <ul
            className={cn(
              'scroll-themed flex flex-col gap-2 overflow-y-auto pr-1.5',
              fillHeight ? 'min-h-0 flex-1' : 'max-h-[240px]',
            )}
          >
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start gap-2 text-[12.5px] text-[var(--ink-soft)]">
                <Check size={13} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <span className="min-w-0">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
