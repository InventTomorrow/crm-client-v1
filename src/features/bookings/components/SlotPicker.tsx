'use client';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { AvailabilityDay } from '../types';
import { formatSlotDate, SLOT_UNAVAILABLE_LABELS } from '../utils/appointmentFormat';

interface SlotPickerProps {
  days: AvailabilityDay[];
  timezone: string;
  /** ISO instant of the picked slot. */
  value: string | null;
  onChange: (startsAt: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/** Day-by-day grid of computed slots. Taken and too-soon slots stay visible but unpickable,
 * so the calendar reads as a real week rather than a shrinking list. */
export function SlotPicker({
  days,
  timezone,
  value,
  onChange,
  isLoading,
  disabled,
}: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  const daysWithOpenSlots = days.filter((day) =>
    day.slots.some((slot) => slot.isAvailable),
  );

  if (daysWithOpenSlots.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-6 text-center text-[12px] text-[var(--ink-mute)]">
        No open slots in this window. Widen your availability or look further ahead.
      </p>
    );
  }

  return (
    <div className="flex max-h-[320px] flex-col gap-4 overflow-y-auto pr-1">
      {daysWithOpenSlots.map((day) => (
        <div key={day.date} className="flex flex-col gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
            {formatSlotDate(day.slots[0]!.startsAt, timezone)}
          </p>

          <div className="flex flex-wrap gap-2">
            {day.slots.map((slot) => {
              const isSelected = value === slot.startsAt;
              const title = slot.unavailableReason
                ? SLOT_UNAVAILABLE_LABELS[slot.unavailableReason]
                : undefined;

              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  title={title}
                  disabled={disabled || !slot.isAvailable}
                  onClick={() => onChange(slot.startsAt)}
                  className={cn(
                    'h-9 rounded-lg border px-3 text-[12px] font-medium whitespace-nowrap transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                      : slot.isAvailable
                        ? 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:border-[var(--accent)]'
                        : 'cursor-not-allowed border-dashed border-[var(--line)] bg-transparent text-[var(--ink-mute)] line-through',
                  )}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
