'use client';
import { Button } from '@/shared/ui/Button';
import { TimePicker } from '@/shared/ui/TimePicker';
import { Plus, X } from 'lucide-react';
import { minutesBetween, type BookingWindow } from '../types';
import { describeWindowSlots } from '../utils/appointmentFormat';

interface WorkingHoursFieldProps {
  value: BookingWindow[];
  onChange: (workingHours: BookingWindow[]) => void;
  /** Drives the "≈ N slots" preview — the grid steps by duration + buffer. */
  durationMinutes: number;
  bufferMinutes: number;
  disabled?: boolean;
}

const DEFAULT_WINDOW: BookingWindow = { startTime: '10:00', endTime: '13:00' };

/**
 * The hours the business is open. Slots are generated inside each window rather
 * than typed one by one, so "2:00 PM – 2:30 PM" comes out of the duration, not
 * a hand-maintained list. A second window covers a lunch break.
 */
export function WorkingHoursField({
  value,
  onChange,
  durationMinutes,
  bufferMinutes,
  disabled,
}: WorkingHoursFieldProps) {
  const updateWindow = (index: number, patch: Partial<BookingWindow>) => {
    onChange(value.map((window, i) => (i === index ? { ...window, ...patch } : window)));
  };

  const removeWindow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-center text-[11.5px] text-[var(--ink-mute)]">
          No hours set — the bot has no times to offer.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {value.map((window, index) => {
            const spanMinutes = minutesBetween(window.startTime, window.endTime);
            const isTooShort = spanMinutes > 0 && spanMinutes < durationMinutes;
            const isInverted = spanMinutes <= 0;

            return (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <TimePicker
                    className="w-[140px]"
                    aria-label="Window start time"
                    value={window.startTime}
                    disabled={disabled}
                    onChange={(startTime) => updateWindow(index, { startTime })}
                  />
                  <span className="text-[12px] text-[var(--ink-mute)]">to</span>
                  <TimePicker
                    className="w-[140px]"
                    aria-label="Window end time"
                    value={window.endTime}
                    disabled={disabled}
                    onChange={(endTime) => updateWindow(index, { endTime })}
                  />

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeWindow(index)}
                    aria-label="Remove this window"
                    className="ml-auto text-[var(--ink-mute)] transition-colors hover:text-destructive disabled:pointer-events-none"
                  >
                    <X size={14} />
                  </button>
                </div>

                {isInverted ? (
                  <p className="text-[11.5px] text-destructive">Must end after it starts.</p>
                ) : isTooShort ? (
                  <p className="text-[11.5px] text-destructive">
                    Too short for a {durationMinutes}-minute meeting.
                  </p>
                ) : (
                  <p className="text-[11.5px] text-[var(--ink-mute)]">
                    {describeWindowSlots(window, durationMinutes, bufferMinutes)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        disabled={disabled}
        onClick={() => onChange([...value, DEFAULT_WINDOW])}
      >
        <Plus size={13} className="mr-1.5" /> Add hours
      </Button>
    </div>
  );
}
