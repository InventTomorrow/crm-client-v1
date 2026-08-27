'use client';
import { WeekdayPicker } from '@/features/bookings/components/WeekdayPicker';
import { WorkingHoursField } from '@/features/bookings/components/WorkingHoursField';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Switch } from '@/shared/ui/Switch';
import type { BookingWindow, PractitionerScheduleInput, Weekday } from '../types';

interface PractitionerScheduleFieldsProps {
  value: PractitionerScheduleInput | null;
  onChange: (schedule: PractitionerScheduleInput | null) => void;
  /** Clinic-wide fallbacks, shown as the placeholder for every blank override. */
  clinicDefaults: {
    durationMinutes: number;
    bufferMinutes: number;
    maxPerDay: number;
  };
  disabled?: boolean;
}

const EMPTY_SCHEDULE: PractitionerScheduleInput = {
  availableDays: [],
  workingHours: [],
  durationMinutes: null,
  bufferMinutes: null,
  maxPerDay: null,
  minAdvanceHours: null,
  maxAdvanceDays: null,
};

/**
 * A practitioner's own hours. Every field is optional — blank inherits the
 * clinic-wide value, which is why the placeholders show what would apply.
 */
export function PractitionerScheduleFields({
  value,
  onChange,
  clinicDefaults,
  disabled,
}: PractitionerScheduleFieldsProps) {
  const hasOwnSchedule = value !== null;
  const schedule = value ?? EMPTY_SCHEDULE;

  const patch = (changes: Partial<PractitionerScheduleInput>) =>
    onChange({ ...schedule, ...changes });

  const numberField = (
    key:
      | 'durationMinutes'
      | 'bufferMinutes'
      | 'maxPerDay'
      | 'minAdvanceHours'
      | 'maxAdvanceDays',
    label: string,
    placeholder: string,
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={`schedule-${key}`}>{label}</Label>
      <Input
        id={`schedule-${key}`}
        type="number"
        inputMode="numeric"
        placeholder={placeholder}
        value={(schedule[key] as number | null | undefined) ?? ''}
        disabled={disabled || !hasOwnSchedule}
        onChange={(event) =>
          patch({
            [key]:
              event.target.value === '' ? null : Number(event.target.value),
          })
        }
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="own-schedule">Own working hours</Label>
          <p className="text-muted-foreground text-sm">
            Off, this practitioner is bookable during the clinic-wide hours. On,
            they keep their own days and times.
          </p>
        </div>
        <Switch
          id="own-schedule"
          checked={hasOwnSchedule}
          disabled={disabled}
          onCheckedChange={(checked) =>
            onChange(checked ? EMPTY_SCHEDULE : null)
          }
        />
      </div>

      {hasOwnSchedule && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Days</Label>
            <WeekdayPicker
              value={schedule.availableDays as Weekday[]}
              onChange={(days) => patch({ availableDays: days })}
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Hours</Label>
            <WorkingHoursField
              value={schedule.workingHours as BookingWindow[]}
              onChange={(workingHours) => patch({ workingHours })}
              durationMinutes={
                (schedule.durationMinutes as number | null | undefined) ??
                clinicDefaults.durationMinutes
              }
              bufferMinutes={
                (schedule.bufferMinutes as number | null | undefined) ??
                clinicDefaults.bufferMinutes
              }
              disabled={disabled}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {numberField(
              'durationMinutes',
              'Appointment length (min)',
              `${clinicDefaults.durationMinutes} (clinic default)`,
            )}
            {numberField(
              'bufferMinutes',
              'Gap between (min)',
              `${clinicDefaults.bufferMinutes} (clinic default)`,
            )}
            {numberField(
              'maxPerDay',
              'Max per day',
              `${clinicDefaults.maxPerDay} (clinic default)`,
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Leave a box blank to use the clinic-wide setting. The service being
            booked can still override the appointment length.
          </p>
        </div>
      )}
    </div>
  );
}
