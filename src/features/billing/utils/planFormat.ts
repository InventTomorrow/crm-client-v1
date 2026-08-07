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

/** pkr() for the PKR default; Intl.NumberFormat fallback for any other currency. */
export function formatPlanPrice(plan: Pick<Plan, 'price' | 'currency'>): string {
  if (plan.currency === 'PKR') return pkr(plan.price);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: plan.currency }).format(plan.price);
}
