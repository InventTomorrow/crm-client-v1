'use client';
import { Button } from '@/shared/ui/Button';
import { CalendarClock, Clock, MessageSquare, SlidersHorizontal } from 'lucide-react';

const SETUP_STEPS = [
  {
    id: 'meeting',
    label: 'Name the meeting',
    description: 'What leads are booking and how it happens.',
    Icon: CalendarClock,
  },
  {
    id: 'availability',
    label: 'Set your hours',
    description: 'The days and hours you take calls — slots are generated inside them.',
    Icon: Clock,
  },
  {
    id: 'limits',
    label: 'Add guardrails',
    description: 'Notice period, daily cap and how far ahead leads can book.',
    Icon: SlidersHorizontal,
  },
  {
    id: 'messages',
    label: 'Write the messages',
    description: 'Confirmation and reminder copy sent around the call.',
    Icon: MessageSquare,
  },
];

interface BookingsEmptyStateProps {
  onSetup: () => void;
  /** Booking by hand works without a config — this is the way out of the setup dead end. */
  onBookManually: () => void;
}

/** Shown until a workspace saves its first BookingConfig — the bot cannot offer a slot before then. */
export function BookingsEmptyState({ onSetup, onBookManually }: BookingsEmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-6 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
        <CalendarClock size={22} />
      </span>

      <div className="max-w-[420px]">
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">
          Booking isn&apos;t set up yet
        </h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
          Until you set your hours the bot can qualify a lead but has no slot to offer them.
        </p>
      </div>

      <div className="grid w-full max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-2">
        {SETUP_STEPS.map(({ id, label, description, Icon }) => (
          <div
            key={id}
            className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-left"
          >
            <span className="mt-0.5 shrink-0 text-[var(--accent)]">
              <Icon size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-[var(--ink)]">{label}</p>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-mute)]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={onSetup}>Set up booking</Button>
        <Button variant="outline" onClick={onBookManually}>
          Book a call yourself
        </Button>
      </div>
    </div>
  );
}
