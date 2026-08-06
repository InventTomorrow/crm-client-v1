import type { FormWizardStep } from '@/shared/hooks/useFormWizard';
import { CalendarClock, CheckCircle2, ListChecks, UserRound } from 'lucide-react';
import type { ManualBookingFormInput } from '../types';

/**
 * The owner walks these in order because each one narrows the next: no availability to
 * pick until we know who it is for, no confirmation until there is a time.
 */
export const MANUAL_BOOKING_STEPS: FormWizardStep<ManualBookingFormInput>[] = [
  {
    id: 'lead',
    label: 'Who',
    title: 'Who is this call with?',
    description: 'Find them in your leads, or add someone you spoke to for the first time.',
    Icon: UserRound,
    fields: ['leadId', 'customerPhone'],
    isComplete: (booking) => !!booking.leadId && !!booking.customerPhone,
  },
  {
    id: 'answers',
    label: 'Questions',
    title: 'What did they tell you?',
    description: 'The same questions your bot asks. Fill in what you learned, skip the rest.',
    Icon: ListChecks,
    fields: ['answers'],
    // Nothing here gates the booking — a call taken on the phone is still a call.
    isComplete: () => true,
    isOptional: true,
  },
  {
    id: 'slot',
    label: 'When',
    title: 'Pick a time',
    description: 'Your open slots, or a custom time if you already agreed one.',
    Icon: CalendarClock,
    fields: ['scheduledAt'],
    isComplete: (booking) => !!booking.scheduledAt,
  },
  {
    id: 'confirm',
    label: 'Confirm',
    title: 'Confirm the booking',
    description: 'A last look before it lands on the calendar.',
    Icon: CheckCircle2,
    fields: ['notes'],
    isComplete: (booking) => !!booking.leadId && !!booking.scheduledAt,
  },
];
