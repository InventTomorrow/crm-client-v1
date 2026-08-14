'use client';
import { cn } from '@/lib/utils';
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from '../types';

interface WeekdayPickerProps {
  value: Weekday[];
  onChange: (days: Weekday[]) => void;
  disabled?: boolean;
}

/** Week-ordered day toggles — the days the bot is allowed to offer. */
export function WeekdayPicker({ value, onChange, disabled }: WeekdayPickerProps) {
  const toggleDay = (day: Weekday) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((day) => {
        const isSelected = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            disabled={disabled}
            aria-pressed={isSelected}
            onClick={() => toggleDay(day)}
            className={cn(
              'h-9 min-w-[52px] rounded-lg border px-3 text-[12px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-mute)] hover:text-[var(--ink)]',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            {WEEKDAY_LABELS[day]}
          </button>
        );
      })}
    </div>
  );
}
