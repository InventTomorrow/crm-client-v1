'use client';
import type { BusinessVertical } from '@/lib/business-verticals';
import { PlanLimitsList } from './PlanLimitsList';
import { formatPlanPeriod, formatPlanPrice } from '../utils/planFormat';
import type { Subscription } from '../types';

interface PlanUsageCardProps {
  subscription: Subscription;
  tenantVertical: BusinessVertical | undefined;
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

/**
 * What the workspace's current plan actually allows. These are the plan's
 * limits, not live consumption — usage counters aren't tracked yet, so this
 * deliberately says "included" rather than showing a used/remaining split it
 * can't compute honestly.
 */
export function PlanUsageCard({ subscription, tenantVertical }: PlanUsageCardProps) {
  const plan = subscription.plan;
  if (!plan) return null;

  const isTrial = subscription.status === 'TRIALING';
  const daysLeft = daysUntil(isTrial ? subscription.trialEndsAt : subscription.currentPeriodEnd);

  return (
    <div className="card p-5 sm:p-[22px]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">What&apos;s included</h3>
          <p className="text-[13px] mt-0.5 text-[var(--ink-soft)]">
            {plan.name} · {formatPlanPrice(plan)}{' '}
            {formatPlanPeriod(plan.duration, plan.customDurationDays)}
          </p>
        </div>
        {daysLeft !== null && (
          <span
            className={`badge font-medium ${
              isTrial ? 'text-info-foreground bg-info-soft' : 'text-[var(--ink-soft)] bg-[var(--line-soft)]'
            }`}
          >
            {daysLeft} day{daysLeft === 1 ? '' : 's'} {isTrial ? 'of trial left' : 'left'}
          </span>
        )}
      </div>

      <div className="mt-4 border-t border-[var(--line)] pt-4">
        <PlanLimitsList plan={plan} tenantVertical={tenantVertical} variant="grid" />
      </div>
    </div>
  );
}
