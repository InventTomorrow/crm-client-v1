import type { FormWizardStep } from '@/shared/hooks/useFormWizard';
import { Eye, FileText, Layers, Tag, Target } from 'lucide-react';
import { serviceCompletionRules, type ServiceOfferingFormInput } from '../types';

/** The add/edit service form, one section at a time. `fields` is what react-hook-form
 * validates on Next; `isComplete` is what the rail's check mark reads. */
export const SERVICE_FORM_STEPS: FormWizardStep<ServiceOfferingFormInput>[] = [
  {
    id: 'basics',
    label: 'Basics',
    title: 'Basics',
    description: 'What this service is called, and the detail the bot answers questions from.',
    Icon: FileText,
    fields: ['name', 'shortDescription', 'fullDescription', 'category'],
    isComplete: serviceCompletionRules.hasBasics,
  },
  {
    id: 'pricing',
    label: 'Delivery & pricing',
    title: 'Delivery & pricing',
    description: 'How the engagement runs and the number quoted before plans are discussed.',
    Icon: Tag,
    fields: ['deliveryType', 'pricingType', 'startingPrice', 'currency'],
    isComplete: serviceCompletionRules.hasPricing,
  },
  {
    id: 'positioning',
    label: 'Positioning',
    title: 'Positioning',
    description: 'The outcomes and platforms the bot leans on when a lead is comparing options.',
    Icon: Target,
    fields: ['keyOutcomes', 'platformsCovered', 'sampleWorkUrl'],
    isComplete: serviceCompletionRules.hasPositioning,
  },
  {
    id: 'plans',
    label: 'Plans',
    title: 'Plans',
    description:
      'Pricing tiers for this service. Reorder them — the first tier is what the bot leads with.',
    Icon: Layers,
    fields: ['plans'],
    isComplete: serviceCompletionRules.hasPlans,
  },
  {
    id: 'visibility',
    label: 'Visibility',
    title: 'Visibility',
    description: 'Whether the bot may offer this service, and where it sits in the catalog.',
    Icon: Eye,
    fields: ['isActive', 'displayOrder'],
    // Both fields ship with usable defaults, so this never holds Save back.
    isComplete: () => true,
    isOptional: true,
  },
];
