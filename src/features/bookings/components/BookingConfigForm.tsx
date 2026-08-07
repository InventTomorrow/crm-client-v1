"use client";
import { Button } from "@/shared/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { FormSection } from "@/shared/ui/FormSection";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import {
  CalendarClock,
  Clock,
  MessageSquare,
  SlidersHorizontal,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { useBookingConfigForm } from "../hooks/useBookings";
import { MEETING_TYPES, MEETING_TYPE_LABELS } from "../types";
import { WeekdayPicker } from "./WeekdayPicker";
import { WorkingHoursField } from "./WorkingHoursField";

const COMMON_TIMEZONES = [
  "Asia/Karachi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

/** Editor for the single BookingConfig per workspace — what the bot is allowed to offer. */
export function BookingConfigForm({ onSaved }: { onSaved?: () => void }) {
  const { form, isLoading, isSaving, handleSubmit } = useBookingConfigForm({
    ...(onSaved ? { onSaved } : {}),
  });

  // The hours editor previews how many slots each window yields, which depends
  // on these two — so it has to re-render as they're typed.
  const durationMinutes = useWatch({
    control: form.control,
    name: "durationMinutes",
  });
  const bufferMinutes = useWatch({
    control: form.control,
    name: "bufferMinutes",
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <FormSection
          title="The meeting"
          description="What leads are booking, and how it happens."
          Icon={CalendarClock}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Free Strategy Session"
                      disabled={isSaving}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What the bot calls it when offering a slot.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting type</FormLabel>
                  <Select
                    value={field.value ?? undefined}
                    onValueChange={field.onChange}
                    disabled={isSaving}
                  >
                    <FormControl>
                      <SelectTrigger className="h-10 w-full">
                        <SelectValue placeholder="Pick how the call happens">
                          {field.value
                            ? MEETING_TYPE_LABELS[field.value]
                            : undefined}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEETING_TYPES.map((meetingType) => (
                        <SelectItem key={meetingType} value={meetingType}>
                          {MEETING_TYPE_LABELS[meetingType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How the meeting is held — the bot tells the lead this when
                    confirming.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Description
                  <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                    Optional
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="A 30-minute call to understand your goals and map out a plan."
                    disabled={isSaving}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex-row items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
                <div className="min-w-0 flex flex-col gap-1">
                  <FormLabel>Accepting bookings</FormLabel>
                  <FormDescription>
                    Turn off to stop the bot offering slots without losing this
                    setup.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSaving}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          title="When you're available"
          description="Slots are generated from these days and times — never stored, so editing here updates every future day at once."
          Icon={Clock}
        >
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSaving}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Pick a timezone">
                        {field.value ? field.value.replace("_", " ") : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMMON_TIMEZONES.map((timezone) => (
                      <SelectItem key={timezone} value={timezone}>
                        {timezone.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The times below are read in this zone. Leads see their own
                  local time.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availableDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available days</FormLabel>
                <FormControl>
                  <WeekdayPicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workingHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Booking hours</FormLabel>
                <FormControl>
                  <WorkingHoursField
                    value={field.value}
                    onChange={field.onChange}
                    durationMinutes={durationMinutes}
                    bufferMinutes={bufferMinutes}
                    disabled={isSaving}
                  />
                </FormControl>
                <FormDescription>
                  Slots are generated inside these hours from the duration
                  below, and offered on every available day. Add a second window
                  to close over lunch.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection
          title="Limits"
          description="Guardrails so the calendar stays realistic."
          Icon={SlidersHorizontal}
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5}
                      disabled={isSaving}
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How long one meeting runs. Every offered slot is this long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bufferMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buffer between calls (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isSaving}
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Breathing room after each call before the next slot opens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max bookings per day</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isSaving}
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Once this many are booked, the rest of that day is closed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minAdvanceHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum notice (hours)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={isSaving}
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Slots sooner than this are never offered, so you always get
                    time to prepare.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxAdvanceDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book up to (days ahead)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isSaving}
                      {...field}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    How far into the future the calendar stays open to leads.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <FormSection
          title="What the bot says"
          description="Sent automatically around the booking."
          Icon={MessageSquare}
        >
          <FormField
            control={form.control}
            name="confirmationMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmation message</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="You're booked! We'll speak on {{date}} at {{time}}."
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Sent the moment a slot is taken.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reminder message</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Reminder: our call is in an hour."
                    disabled={isSaving}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Sent shortly before the call to cut no-shows.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reminderLeadMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send reminder (minutes before)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    disabled={isSaving}
                    {...field}
                    onChange={(event) =>
                      field.onChange(Number(event.target.value))
                    }
                  />
                </FormControl>
                <FormDescription>
                  Reminders are stored with the booking. Automatic delivery
                  ships with the message scheduler.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save booking settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
