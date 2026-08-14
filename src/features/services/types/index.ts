import type { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

// ─── Enums (mirror server Prisma enums) ──────────────────────────────────────

export const DELIVERY_TYPES = ['MONTHLY_RETAINER', 'ONE_TIME', 'PROJECT_BASED'] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];

export const DELIVERY_TYPE_LABELS: Record<DeliveryType, string> = {
  MONTHLY_RETAINER: 'Monthly Retainer',
  ONE_TIME: 'One-Time',
  PROJECT_BASED: 'Project-Based',
};

export const PRICING_TYPES = ['FIXED', 'TIERED', 'CUSTOM_QUOTE'] as const;
export type PricingType = (typeof PRICING_TYPES)[number];

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  FIXED: 'Fixed Price',
  TIERED: 'Tiered Plans',
  CUSTOM_QUOTE: 'Custom Quote',
};

export const BILLING_CYCLES = ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

/** Only what billing is actually run in today — the picker stays closed rather than createable
 * so a typo can never reach the API as a currency code. */
export const CURRENCIES = ['PKR'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  PKR: 'PKR — Pakistani Rupee',
};

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
  ONE_TIME: 'One-Time',
};

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface ServicePlan {
  key: string;
  name: string;
  price?: number | null;
  billingCycle: BillingCycle;
  minContractMonths: number;
  features: string[];
  deliverables?: Record<string, unknown> | null;
  bestFor?: string | null;
  isHighlighted: boolean;
  isCustomQuote: boolean;
  displayOrder: number;
}

export interface ServiceOffering {
  id: string;
  tenantId: string;
  name: string;
  shortDescription: string;
  fullDescription?: string | null;
  category?: string | null;
  deliveryType: DeliveryType;
  pricingType: PricingType;
  startingPrice?: number | null;
  currency: string;
  platformsCovered: string[];
  keyOutcomes: string[];
  sampleWorkUrl?: string | null;
  imageUrls: string[];
  plans: ServicePlan[];
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Form schemas ─────────────────────────────────────────────────────────────

export const servicePlanFormSchema = z.object({
  key: z.string().min(1, 'Plan key is required'),
  name: z.string().min(1, 'Plan name is required'),
  price: z.number().nullable().optional(),
  billingCycle: z.enum(BILLING_CYCLES).default('MONTHLY'),
  minContractMonths: z.number().int().min(0).default(0),
  features: z.array(z.string()).default([]),
  bestFor: z.string().nullable().optional(),
  isHighlighted: z.boolean().default(false),
  isCustomQuote: z.boolean().default(false),
  displayOrder: z.number().int().default(0),
});
export type ServicePlanFormData = z.infer<typeof servicePlanFormSchema>;

export const serviceOfferingFormSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  fullDescription: z.string().optional(),
  category: z.string().optional(),
  // No default — the picker starts empty so the choice is made deliberately, not inherited.
  deliveryType: z.enum(DELIVERY_TYPES, { error: 'Select how this service is delivered.' }),
  pricingType: z.enum(PRICING_TYPES, { error: 'Select how this service is priced.' }),
  startingPrice: z.number().nullable().optional(),
  currency: z.enum(CURRENCIES).default('PKR'),
  platformsCovered: z.array(z.string()).default([]),
  keyOutcomes: z.array(z.string()).default([]),
  sampleWorkUrl: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
  plans: z.array(servicePlanFormSchema).default([]),
});
export type ServiceOfferingFormData = z.infer<typeof serviceOfferingFormSchema>;
/** Pre-parse shape — what react-hook-form actually holds, before defaults are applied. */
export type ServiceOfferingFormInput = z.input<typeof serviceOfferingFormSchema>;
export type ServiceOfferingForm = UseFormReturn<
  ServiceOfferingFormInput,
  unknown,
  ServiceOfferingFormData
>;

/** Shared by every field group the service form renders one at a time. */
export interface ServiceFormSectionProps {
  form: ServiceOfferingForm;
  isSaving: boolean;
}

// ─── Add-service completion rules ─────────────────────────────────────────────
// Deliberately stricter than the server contract: a thin service still saves through
// the API (so services created before these rules stay editable), but the add-service
// wizard holds out for the fields the bot needs to sell without escalating to a human.

export const MIN_KEY_OUTCOMES = 2;

/** Loose shape so both the schema (post-parse) and the checklist (mid-typing) can pass values in. */
interface ServiceCompletionValues {
  name?: string;
  shortDescription?: string;
  fullDescription?: string | null;
  category?: string | null;
  deliveryType?: DeliveryType;
  pricingType?: PricingType;
  startingPrice?: number | null;
  keyOutcomes?: string[];
  plans?: unknown[];
}

const countNonEmpty = (entries?: string[]) =>
  (entries ?? []).filter((entry) => entry.trim().length > 0).length;

export const serviceCompletionRules = {
  /** Full description is optional — it enriches the bot's answers but never blocks the step. */
  hasBasics: (values: ServiceCompletionValues) =>
    !!values.name?.trim() && !!values.shortDescription?.trim() && !!values.category?.trim(),

  /** Quote-only services are priced in conversation, so they are exempt from the price itself. */
  hasPricing: (values: ServiceCompletionValues) =>
    !!values.deliveryType &&
    !!values.pricingType &&
    (values.pricingType === 'CUSTOM_QUOTE' ||
      (values.startingPrice != null && values.startingPrice > 0)),

  hasPositioning: (values: ServiceCompletionValues) =>
    countNonEmpty(values.keyOutcomes) >= MIN_KEY_OUTCOMES,

  /** Only tiered pricing is broken without plans — fixed and quote-only are not. */
  hasPlans: (values: ServiceCompletionValues) =>
    values.pricingType !== 'TIERED' || (values.plans?.length ?? 0) > 0,
};

/** Resolver for the add-service wizard. Edit mode keeps `serviceOfferingFormSchema` so
 * services saved before these rules can still be updated. */
export const serviceOfferingWizardSchema = serviceOfferingFormSchema.superRefine(
  (values, ctx) => {
    if (!values.category?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['category'],
        message: 'Pick a category so the bot can place this against your other services.',
      });
    }

    if (!serviceCompletionRules.hasPricing(values)) {
      ctx.addIssue({
        code: 'custom',
        path: ['startingPrice'],
        message: 'Add a starting price, or switch pricing type to Custom Quote.',
      });
    }

    if (!serviceCompletionRules.hasPositioning(values)) {
      ctx.addIssue({
        code: 'custom',
        path: ['keyOutcomes'],
        message: `Add at least ${MIN_KEY_OUTCOMES} outcomes — the bot leans on these when a lead is comparing options.`,
      });
    }

    if (!serviceCompletionRules.hasPlans(values)) {
      ctx.addIssue({
        code: 'custom',
        path: ['plans'],
        message: 'Tiered pricing needs at least one plan.',
      });
    }
  },
);

// ─── Filter type ──────────────────────────────────────────────────────────────

export interface ServiceOfferingFilters {
  search?: string;
  category?: string;
  deliveryType?: DeliveryType;
  pricingType?: PricingType;
  isActive?: boolean;
}
