import type { DefaultValues } from 'react-hook-form';
import type { z } from 'zod';
import {
  CURRENCIES,
  type Currency,
  type ServiceOffering,
  ServiceOfferingFormData,
  serviceOfferingFormSchema,
  ServicePlanFormData,
} from '../types';

type ServiceFormInput = z.input<typeof serviceOfferingFormSchema>;

/** Delivery and pricing type are deliberately absent — an empty picker forces a real choice
 * instead of shipping whichever value happened to be the default. */
export const INITIAL_SERVICE_FORM_VALUES: DefaultValues<ServiceFormInput> = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  category: '',
  startingPrice: null,
  currency: 'PKR',
  platformsCovered: [],
  keyOutcomes: [],
  sampleWorkUrl: '',
  isActive: true,
  displayOrder: 0,
  plans: [],
};

/** The picker only offers the currencies the app supports, so anything else stored against an
 * older service falls back rather than sitting in the form as an unselectable value. */
function toSupportedCurrency(currency: string): Currency {
  return (CURRENCIES as readonly string[]).includes(currency) ? (currency as Currency) : 'PKR';
}

/** Stable slug the bot quotes and bookings reference — must survive reordering, so it is
 * minted once per plan rather than derived from the plan's index or name. */
export function buildPlanKey(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildEmptyPlan(displayOrder: number): ServicePlanFormData {
  return {
    key: buildPlanKey(),
    name: '',
    price: null,
    billingCycle: 'MONTHLY',
    minContractMonths: 1,
    features: [],
    bestFor: '',
    isHighlighted: false,
    isCustomQuote: false,
    displayOrder,
  };
}

/** The API never returns `isCustomQuote` — the server collapses it to `price: null` on write
 * (services.repository.ts `mapPlan`). Deriving it back here is what stops an edit round-trip
 * from silently turning a custom-quote plan into a priceless fixed one. */
export function toPlanFormValues(
  plan: ServiceOffering['plans'][number],
  index: number,
): ServicePlanFormData {
  return {
    key: plan.key || buildPlanKey(),
    name: plan.name,
    price: plan.price ?? null,
    billingCycle: plan.billingCycle,
    minContractMonths: plan.minContractMonths,
    features: plan.features ?? [],
    bestFor: plan.bestFor ?? '',
    isHighlighted: plan.isHighlighted,
    isCustomQuote: plan.price == null,
    displayOrder: plan.displayOrder ?? index,
  };
}

export function toServiceFormValues(service: ServiceOffering): ServiceFormInput {
  return {
    name: service.name,
    shortDescription: service.shortDescription,
    fullDescription: service.fullDescription ?? '',
    category: service.category ?? '',
    deliveryType: service.deliveryType,
    pricingType: service.pricingType,
    startingPrice: service.startingPrice ?? null,
    currency: toSupportedCurrency(service.currency),
    platformsCovered: service.platformsCovered ?? [],
    keyOutcomes: service.keyOutcomes ?? [],
    sampleWorkUrl: service.sampleWorkUrl ?? '',
    isActive: service.isActive,
    displayOrder: service.displayOrder,
    plans: (service.plans ?? []).map(toPlanFormValues),
  };
}

/** Empty strings are how the form represents "not set"; the API wants null so the field is
 * actually cleared rather than stored as "". */
export function toServicePayload(formData: ServiceOfferingFormData) {
  return {
    name: formData.name.trim(),
    shortDescription: formData.shortDescription.trim(),
    fullDescription: formData.fullDescription?.trim() || null,
    category: formData.category?.trim() || null,
    deliveryType: formData.deliveryType,
    pricingType: formData.pricingType,
    startingPrice: formData.startingPrice ?? null,
    currency: formData.currency,
    platformsCovered: formData.platformsCovered.filter(Boolean),
    keyOutcomes: formData.keyOutcomes.filter(Boolean),
    sampleWorkUrl: formData.sampleWorkUrl?.trim() || null,
    isActive: formData.isActive,
    displayOrder: formData.displayOrder,
    plans: formData.plans.map((plan, index) => ({
      ...plan,
      name: plan.name.trim(),
      bestFor: plan.bestFor?.trim() || null,
      price: plan.isCustomQuote ? null : plan.price ?? null,
      features: plan.features.map((feature) => feature.trim()).filter(Boolean),
      displayOrder: index,
    })),
  };
}
