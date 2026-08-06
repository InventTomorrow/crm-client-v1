'use client';
import { Button } from '@/shared/ui/Button';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { CalendarPlus, CalendarRange } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import type {
  Availability,
  ManualBookingFormData,
  ManualBookingFormInput,
} from '../../types';
import {
  formatAppointmentSlot,
  isoToLocalInput,
  localInputToIso,
} from '../../utils/appointmentFormat';
import { SlotPicker } from '../SlotPicker';

interface BookingSlotStepProps {
  form: UseFormReturn<ManualBookingFormInput, unknown, ManualBookingFormData>;
  availability: Availability | undefined;
  timezone: string;
  isLoadingAvailability?: boolean;
  disabled?: boolean;
}

/**
 * Two ways to land on a time. The slot grid is the same computed availability the bot
 * offers, so a manual booking cannot collide with one the bot is about to make. The
 * custom time exists for the call the owner already agreed by phone — it skips the
 * availability check server-side but is still refused if the slot is genuinely taken.
 */
export function BookingSlotStep({
  form,
  availability,
  timezone,
  isLoadingAvailability = false,
  disabled = false,
}: BookingSlotStepProps) {
  const isCustomTime = useWatch({ control: form.control, name: 'isCustomTime' });
  const scheduledAt = useWatch({ control: form.control, name: 'scheduledAt' });
  const hasAvailability = (availability?.days.length ?? 0) > 0;

  function switchMode(nextIsCustomTime: boolean) {
    form.setValue('isCustomTime', nextIsCustomTime);
    form.setValue('scheduledAt', '', { shouldValidate: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={isCustomTime ? 'outline' : 'default'}
          disabled={disabled}
          onClick={() => switchMode(false)}
        >
          <CalendarRange size={13} className="mr-1.5" /> Open slots
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isCustomTime ? 'default' : 'outline'}
          disabled={disabled}
          onClick={() => switchMode(true)}
        >
          <CalendarPlus size={13} className="mr-1.5" /> Custom time
        </Button>
      </div>

      {!isCustomTime && !hasAvailability && !isLoadingAvailability && (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-4 text-center text-[12px] text-[var(--ink-mute)]">
          No calendar set up yet — use a custom time, or set your hours to let the bot book too.
        </p>
      )}

      <FormField
        control={form.control}
        name="scheduledAt"
        render={({ field }) => (
          <FormItem>
            {isCustomTime ? (
              <>
                <FormLabel>Date and time</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    disabled={disabled}
                    value={isoToLocalInput(field.value, timezone)}
                    onChange={(event) =>
                      field.onChange(localInputToIso(event.target.value, timezone))
                    }
                  />
                </FormControl>
                <FormDescription>
                  Read in {timezone.replace('_', ' ')}. This books outside your usual hours —
                  a time someone else already holds is still refused.
                </FormDescription>
              </>
            ) : (
              <>
                <FormLabel>Pick a slot</FormLabel>
                <FormControl>
                  <SlotPicker
                    days={availability?.days ?? []}
                    timezone={timezone}
                    value={field.value || null}
                    onChange={field.onChange}
                    isLoading={isLoadingAvailability}
                    disabled={disabled}
                  />
                </FormControl>
              </>
            )}
            {scheduledAt && (
              <FormDescription>
                Booking {formatAppointmentSlot(scheduledAt, timezone)}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
