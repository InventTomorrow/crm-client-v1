import { BILLING_CYCLE_LABELS, type ServicePlanFormData } from '../types';

/** One plan's headline number. Custom-quote tiers have no price by design, so they read as
 * "Custom quote" rather than an empty slot. */
export function formatPlanPrice(plan: ServicePlanFormData, currency: string): string {
  if (plan.isCustomQuote || plan.price == null) return 'Custom quote';
  return `${currency} ${plan.price.toLocaleString()}`;
}

export function formatPlanBillingCycle(plan: ServicePlanFormData): string {
  return BILLING_CYCLE_LABELS[plan.billingCycle];
}

/** Null when there is no commitment — the summary line skips the segment entirely. */
export function formatPlanCommitment(plan: ServicePlanFormData): string | null {
  if (!plan.minContractMonths) return null;
  return `${plan.minContractMonths} month${plan.minContractMonths === 1 ? '' : 's'} min`;
}

/** A plan saved before it was named still needs something to click on in the list. */
export function getPlanDisplayName(plan: ServicePlanFormData, index: number): string {
  return plan.name.trim() || `Tier ${index + 1}`;
}

export function countPlanFeatures(plan: ServicePlanFormData): number {
  return plan.features.filter((feature) => feature.trim().length > 0).length;
}
