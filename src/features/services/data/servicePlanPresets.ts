import type { BillingCycle, ServicePlanFormData } from '../types';
import { buildPlanKey } from '../utils/serviceFormMapping';

interface PlanPresetTier {
  name: string;
  bestFor: string;
  minContractMonths: number;
  isHighlighted: boolean;
  isCustomQuote: boolean;
}

export interface ServicePlanPreset {
  id: string;
  label: string;
  description: string;
  billingCycle: BillingCycle;
  tiers: PlanPresetTier[];
}

/** Tier scaffolds — names and cadence only. Features and prices stay empty because they differ
 * per service; this exists to save retyping the ladder, not to suggest what a plan contains. */
export const SERVICE_PLAN_PRESETS: ServicePlanPreset[] = [
  {
    id: 'three-tier-retainer',
    label: 'Basic · Growth · Pro',
    description: 'Three monthly retainer tiers — the usual agency ladder.',
    billingCycle: 'MONTHLY',
    tiers: [
      { name: 'Basic', bestFor: 'Small businesses starting out', minContractMonths: 3, isHighlighted: false, isCustomQuote: false },
      { name: 'Growth', bestFor: 'Established businesses scaling up', minContractMonths: 3, isHighlighted: true, isCustomQuote: false },
      { name: 'Pro', bestFor: 'High-volume brands', minContractMonths: 6, isHighlighted: false, isCustomQuote: false },
    ],
  },
  {
    id: 'starter-enterprise',
    label: 'Starter · Professional · Enterprise',
    description: 'Three tiers with a custom-quote top end.',
    billingCycle: 'MONTHLY',
    tiers: [
      { name: 'Starter', bestFor: 'Solo founders and new brands', minContractMonths: 1, isHighlighted: false, isCustomQuote: false },
      { name: 'Professional', bestFor: 'Growing teams', minContractMonths: 3, isHighlighted: true, isCustomQuote: false },
      { name: 'Enterprise', bestFor: 'Large accounts with custom scope', minContractMonths: 12, isHighlighted: false, isCustomQuote: true },
    ],
  },
  {
    id: 'one-time-project',
    label: 'Standard · Premium (one-time)',
    description: 'Two project-based tiers billed once.',
    billingCycle: 'ONE_TIME',
    tiers: [
      { name: 'Standard', bestFor: 'Straightforward one-off projects', minContractMonths: 0, isHighlighted: false, isCustomQuote: false },
      { name: 'Premium', bestFor: 'Larger scope with extra revisions', minContractMonths: 0, isHighlighted: true, isCustomQuote: false },
    ],
  },
];

export function buildPlansFromPreset(preset: ServicePlanPreset): ServicePlanFormData[] {
  return preset.tiers.map((tier, index) => ({
    key: buildPlanKey(),
    name: tier.name,
    price: null,
    billingCycle: preset.billingCycle,
    minContractMonths: tier.minContractMonths,
    features: [],
    bestFor: tier.bestFor,
    isHighlighted: tier.isHighlighted,
    isCustomQuote: tier.isCustomQuote,
    displayOrder: index,
  }));
}
