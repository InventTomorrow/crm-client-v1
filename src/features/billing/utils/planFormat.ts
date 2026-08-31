import { pkr } from '@/lib/utils';
import type { Plan, PlanDuration } from '../types';

const DURATION_LABEL: Record<Exclude<PlanDuration, 'CUSTOM_DAYS'>, string> = {
  DAYS_3: '3 days',
  DAYS_7: '7 days',
  DAYS_14: '14 days',
  MONTHLY: 'month',
  QUARTERLY: 'quarter',
  SEMI_ANNUAL: '6 months',
  ANNUAL: 'year',
};

/** "/ month", "/ 7 days", "/ 5 days" (custom trial) — never hardcode "/ month". */
export function formatPlanPeriod(duration: PlanDuration, customDurationDays: number | null): string {
  if (duration === 'CUSTOM_DAYS') {
    const days = customDurationDays ?? 0;
    return `/ ${days} day${days === 1 ? '' : 's'}`;
  }
  return `/ ${DURATION_LABEL[duration]}`;
}

/** Durations whose label is one countable unit ("month" → "2 months"). The
 *  rest are already spans ("7 days"), so they multiply instead. */
const PLURALISABLE_DURATIONS: PlanDuration[] = ['MONTHLY', 'QUARTERLY', 'ANNUAL'];

/** "2 months", "1 year", "2 × 7 days" — the span a multi-period link sells. */
export function formatPeriodCount(
  count: number,
  duration: PlanDuration,
  customDurationDays: number | null,
): string {
  const unit = formatPlanPeriod(duration, customDurationDays).replace('/ ', '');
  if (!PLURALISABLE_DURATIONS.includes(duration)) {
    return count === 1 ? unit : `${count} × ${unit}`;
  }
  return `${count} ${unit}${count === 1 ? '' : 's'}`;
}

const DURATION_TAB_LABEL: Record<PlanDuration, string> = {
  DAYS_3: '3 days',
  DAYS_7: '7 days',
  DAYS_14: '14 days',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  SEMI_ANNUAL: '6 months',
  ANNUAL: 'Yearly',
  CUSTOM_DAYS: 'Custom',
};

/**
 * Standalone label for the duration filter chips. Distinct from
 * formatPlanPeriod, which reads as a price suffix ("/ month") and looks wrong
 * on its own once the slash is stripped.
 */
export function formatDurationLabel(duration: PlanDuration): string {
  return DURATION_TAB_LABEL[duration];
}

/** pkr() for the PKR default; Intl.NumberFormat fallback for any other currency. */
export function formatAmount(amount: number, currency: string): string {
  if (currency === 'PKR') return pkr(amount);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

/**
 * What the account owes today — the campaign price when one is running. The
 * server re-derives the same number when it validates the payment, so this is
 * also the amount the checkout form submits.
 */
export function planPayableAmount(plan: Pick<Plan, 'price' | 'offerPrice'>): number {
  return plan.offerPrice ?? plan.price;
}

/** What the account pays today — the campaign price when one is running. */
export function formatPlanPrice(plan: Pick<Plan, 'price' | 'currency' | 'offerPrice'>): string {
  return formatAmount(planPayableAmount(plan), plan.currency);
}

/**
 * The struck-through list price, or null when nothing is discounted. Loose
 * null check on purpose: endpoints that serve an already-subscribed plan
 * (e.g. /billing/subscription) omit the campaign fields entirely, and an
 * undefined offerPrice must read as "no discount", not as a free strike-through.
 */
export function formatPlanListPrice(
  plan: Pick<Plan, 'price' | 'currency' | 'offerPrice'>,
): string | null {
  if (plan.offerPrice == null || plan.offerPrice >= plan.price) return null;
  return formatAmount(plan.price, plan.currency);
}
