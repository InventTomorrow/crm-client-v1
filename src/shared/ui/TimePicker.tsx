'use client';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { Clock } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Meridiem = 'AM' | 'PM';

interface TimePickerProps {
  /** 24-hour "HH:mm" — the same value an `<input type="time">` carries. */
  value: string;
  onChange: (value: string) => void;
  /** Minutes between the offered values. The current minute is always offered too. */
  minuteStep?: number;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
  /** Passed through by shadcn's FormControl, so the trigger keeps the field's wiring. */
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** The time a picker with nothing selected starts from when the first column is touched. */
const FALLBACK_TIME = { hour12: 9, minute: 0, meridiem: 'AM' as Meridiem };

const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MERIDIEMS: Meridiem[] = ['AM', 'PM'];

interface TimeParts {
  hour12: number;
  minute: number;
  meridiem: Meridiem;
}

function parseTime(value: string): TimeParts | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;

  const hour24 = Number(match[1]);
  return {
    hour12: hour24 % 12 || 12,
    minute: Number(match[2]),
    meridiem: hour24 < 12 ? 'AM' : 'PM',
  };
}

function toTimeValue({ hour12, minute, meridiem }: TimeParts): string {
  const hour24 = meridiem === 'PM' ? (hour12 % 12) + 12 : hour12 % 12;
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/** "14:30" → "2:30 PM". Exported so labels elsewhere read the same as the picker. */
export function formatTimeLabel(value: string): string {
  const parts = parseTime(value);
  if (!parts) return '';
  return `${parts.hour12}:${String(parts.minute).padStart(2, '0')} ${parts.meridiem}`;
}

/** One scrollable column of options, keeping the selected row in view when it opens. */
function TimeColumn<T extends number | string>({
  label,
  options,
  selected,
  onSelect,
  formatOption,
}: {
  label: string;
  options: T[];
  selected: T | null;
  onSelect: (option: T) => void;
  formatOption?: (option: T) => string;
}) {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'center' });
    // Only on mount: scrolling on every change would fight the user's own scrolling.
  }, []);

  return (
    <div
      role="listbox"
      aria-label={label}
      className="scroll flex max-h-[196px] w-[68px] flex-col gap-0.5 overflow-y-auto p-1"
    >
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <button
            key={String(option)}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(option)}
            className={cn(
              'shrink-0 rounded-md px-2 py-1.5 text-[12.5px] tabular-nums transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
              isSelected
                ? 'bg-[var(--accent)] font-medium text-[var(--bg)]'
                : 'text-[var(--ink-soft)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]',
            )}
          >
            {formatOption ? formatOption(option) : option}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Hour / minute / AM-PM in three columns, on the workspace's own tokens.
 *
 * Replaces `<input type="time">`, whose dropdown is drawn by the browser and cannot
 * be themed at all — it arrived in the middle of a dark surface wearing Chrome's blue.
 * The value contract is unchanged, so it is a drop-in for the inputs it replaced.
 */
export function TimePicker({
  value,
  onChange,
  minuteStep = 5,
  disabled,
  placeholder = 'Pick a time',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const parts = parseTime(value);

  const minutes = useMemo(() => {
    const stepped = Array.from(
      { length: Math.ceil(60 / minuteStep) },
      (_, index) => index * minuteStep,
    );
    // A time already on file may sit off the step grid — it still has to be selectable.
    return parts && !stepped.includes(parts.minute)
      ? [...stepped, parts.minute].sort((a, b) => a - b)
      : stepped;
  }, [minuteStep, parts]);

  const commit = (patch: Partial<TimeParts>) => {
    onChange(toTimeValue({ ...(parts ?? FALLBACK_TIME), ...patch }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          className={cn(
            'h-9 w-full justify-start px-3 text-[12.5px] font-normal tabular-nums',
            !parts && 'text-[var(--ink-mute)]',
            className,
          )}
        >
          <Clock size={14} className="mr-2 shrink-0 text-[var(--ink-mute)]" />
          {parts ? formatTimeLabel(value) : placeholder}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        {/* Remounted per open so each column re-centres on what is selected now. */}
        {open && (
          <div className="flex divide-x divide-[var(--line)]">
            <TimeColumn
              label="Hour"
              options={HOURS}
              selected={parts?.hour12 ?? null}
              onSelect={(hour12) => commit({ hour12 })}
            />
            <TimeColumn
              label="Minute"
              options={minutes}
              selected={parts?.minute ?? null}
              onSelect={(minute) => commit({ minute })}
              formatOption={(minute) => String(minute).padStart(2, '0')}
            />
            <TimeColumn
              label="AM or PM"
              options={MERIDIEMS}
              selected={parts?.meridiem ?? null}
              onSelect={(meridiem) => commit({ meridiem })}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
