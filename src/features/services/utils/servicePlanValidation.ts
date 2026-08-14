import type { ServicePlanFormData } from '../types';

export interface PlanDraftErrors {
  name?: string;
  price?: string;
}

/** Checked before a tier is allowed to join the list. Deliberately narrow: only the two fields
 * the bot cannot quote a plan without — everything else is optional detail. */
export function validatePlanDraft(plan: ServicePlanFormData): PlanDraftErrors {
  const errors: PlanDraftErrors = {};

  if (!plan.name.trim()) {
    errors.name = 'Name this tier so the bot can refer to it.';
  }

  if (!plan.isCustomQuote && !(plan.price != null && plan.price > 0)) {
    errors.price = 'Add a price, or mark the tier a custom quote.';
  }

  return errors;
}
