'use client';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { useBookAppointmentForm } from '../hooks/useBookAppointmentForm';
import { formatAppointmentSlot } from '../utils/appointmentFormat';
import { SlotPicker } from './SlotPicker';

interface BookAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Manual booking taken by a human — same computed slots the bot offers, so the two can't collide. */
export function BookAppointmentDialog({ open, onOpenChange }: BookAppointmentDialogProps) {
  const {
    form,
    availability,
    isLoadingAvailability,
    isBooking,
    handleSubmit,
    resetForm,
  } = useBookAppointmentForm({
    isOpen: open,
    onBooked: () => onOpenChange(false),
  });

  const timezone = availability?.timezone ?? 'Asia/Karachi';

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Book an appointment</DialogTitle>
          <DialogDescription>
            Times are shown in {timezone.replace('_', ' ')}.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+92 300 1234567" disabled={isBooking} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Customer name
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ayesha Khan"
                      disabled={isBooking}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pick a slot</FormLabel>
                  <FormControl>
                    <SlotPicker
                      days={availability?.days ?? []}
                      timezone={timezone}
                      value={field.value || null}
                      onChange={field.onChange}
                      isLoading={isLoadingAvailability}
                      disabled={isBooking}
                    />
                  </FormControl>
                  {field.value && (
                    <FormDescription>
                      Booking {formatAppointmentSlot(field.value, timezone)}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes
                    <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                      Optional
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="Wants to discuss the retainer package."
                      disabled={isBooking}
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBooking}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBooking}>
                {isBooking ? 'Booking…' : 'Book appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
