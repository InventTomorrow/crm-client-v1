"use client";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
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
import { AutoCompleteSelect } from "@/shared/ui/AutoCompleteSelect";
import { FormSection } from "@/shared/ui/FormSection";
import { Input } from "@/shared/ui/Input";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import {
  CalendarClock,
  Clock,
  MessageSquare,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import { hasCapability } from "@/lib/business-verticals";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { PractitionerVisibilitySelect } from "@/features/practitioners/components/PractitionerVisibilitySelect";
import { useBookingConfigForm } from "../hooks/useBookings";
import { MEETING_TYPES, MEETING_TYPE_LABELS } from "../types";
import { WeekdayPicker } from "./WeekdayPicker";
import { WorkingHoursField } from "./WorkingHoursField";

const meetingTypeOptions = MEETING_TYPES.map((meetingType) => ({
  id: meetingType,
  label: MEETING_TYPE_LABELS[meetingType],
}));

/** Editor for the single BookingConfig per workspace — what the bot is allowed to offer. */
export function BookingConfigForm({ onSaved }: { onSaved?: () => void }) {
  const { form, isLoading, isSaving, handleSubmit } = useBookingConfigForm({
    ...(onSaved ? { onSaved } : {}),
  });
  const vocabulary = useLeadVocabulary();

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

  const { tenant } = useCurrentTenant();
  const isClinical = Boolean(
    tenant && hasCapability(tenant.businessVertical, "PRACTITIONERS"),
  );

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
          description={`What ${vocabulary.plural} are booking, and how it happens.`}
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
                  <FormControl>
                    <AutoCompleteSelect
                      items={meetingTypeOptions}
                      selected={
                        field.value
                          ? {
                              id: field.value,
                              label: MEETING_TYPE_LABELS[field.value],
                            }
                          : null
                      }
                      onSelect={(item) => item && field.onChange(item.id)}
                      placeholder={`Pick how the ${vocabulary.bookingSingular} happens`}
                      disabled={isSaving}
                    />
                  </FormControl>
                  <FormDescription>
                    How the meeting is held — the bot tells the{" "}
                    {vocabulary.singular} this when confirming.
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
          {/* Fixed server-side: every calendar, slot key and spoken time resolves
              the same zone, so this is shown rather than chosen. */}
          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <div className="flex h-9 items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 text-[13px] text-[var(--ink-soft)]">
                  {field.value.replace("_", " ")}
                </div>
                <FormDescription>
                  Every calendar runs on this zone. The times below are read in
                  it, and leads see their own local time.
                </FormDescription>
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
                  <FormLabel>
                    Buffer between {vocabulary.bookingSingular}s (minutes)
                  </FormLabel>
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
                  Sent shortly before the {vocabulary.bookingSingular} to cut
                  no-shows.
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

        {/* Healthcare only — every other vertical books against one shared
            calendar and has no practitioners to expose. */}
        {isClinical && (
          <FormSection
            title="Practitioners"
            description="Whether the assistant may name your practitioners, and whether it may book them."
            Icon={Stethoscope}
          >
            <FormField
              control={form.control}
              name="practitionerVisibility"
              render={({ field }) => (
                <FormItem>
                  <PractitionerVisibilitySelect
                    value={field.value ?? "HIDDEN"}
                    onChange={field.onChange}
                    disabled={isSaving}
                  />
                  <FormDescription>
                    This is the ceiling for the whole clinic. A practitioner may
                    be set narrower than this, never wider — so moving it down
                    to &ldquo;Don&apos;t show&rdquo; genuinely hides everyone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        )}

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save booking settings"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
