import type { FormWizardStep } from '@/shared/hooks/useFormWizard';
import { Calculator, Gauge, MessageSquare, Power } from 'lucide-react';
import type { QualificationFormInput } from '../types';

/** The qualification form, one section at a time. Completion mirrors the schema here rather
 * than tightening it — every saved form already satisfies these, so nothing is locked out. */
export const QUALIFICATION_FORM_STEPS: FormWizardStep<QualificationFormInput>[] = [
  {
    id: 'status',
    label: 'Status',
    title: 'Status',
    description: 'Turn the form off to let the bot chat without qualifying anyone.',
    Icon: Power,
    fields: ['isActive'],
    // A boolean toggle is always in a valid state.
    isComplete: () => true,
    isOptional: true,
  },
  {
    id: 'questions',
    label: 'Questions',
    title: 'Questions',
    description:
      'Keep it short — every extra question is another chance for the lead to drop off.',
    Icon: MessageSquare,
    fields: ['questions'],
    isComplete: (values) => (values.questions?.length ?? 0) > 0,
  },
  {
    id: 'scoring',
    label: 'Scoring',
    title: 'Scoring',
    description: 'Points awarded per answer, then compared against your thresholds.',
    Icon: Calculator,
    fields: ['scoringRules'],
    // Without rules every lead scores zero and lands cold — worth flagging, not worth blocking.
    isComplete: (values) => (values.scoringRules?.length ?? 0) > 0,
    isOptional: true,
  },
  {
    id: 'thresholds',
    label: 'Thresholds',
    title: 'Thresholds',
    description: 'Where a total score lands on the hot / warm / cold scale.',
    Icon: Gauge,
    fields: ['hotThreshold', 'warmThreshold'],
    isComplete: (values) =>
      values.hotThreshold != null &&
      values.warmThreshold != null &&
      values.hotThreshold > values.warmThreshold,
  },
];
