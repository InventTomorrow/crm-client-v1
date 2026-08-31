"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Calendar } from "@/shared/ui/Calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/Popover";
import { Textarea } from "@/shared/ui/Textarea";
import { TimePicker } from "@/shared/ui/TimePicker";
import {
  AutoCompleteSelect,
  type AutoCompleteSelectOption,
} from "@/shared/ui/AutoCompleteSelect";
import { useClinicalServices } from "@/features/clinical-services/hooks/useClinicalServices";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
import { useInfinitePractitioners } from "@/features/practitioners/hooks/usePractitioners";
import { practitionerDisplayName } from "@/features/practitioners/types";
import { CalendarDays, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useWatch } from "react-hook-form";
import { useQuickAppointmentForm } from "../hooks/useQuickAppointmentForm";
import { LeadSelectField } from "./LeadSelectField";

interface QuickAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timezone: string;
  durationMinutes: number;
  /** ISO instant the dialog opens on, when it was launched from a calendar slot. */
  initialScheduledAt?: string | null;
  /** Healthcare only — the other verticals have neither concept. */
  showPractitioner?: boolean;
  showClinicalService?: boolean;
  /** Required where the clinic schedules by doctor; the server refuses one without. */
  requiresPractitioner?: boolean;
  /** Prefilled from the page's own filter, so the doctor being looked at is the default. */
  initialPractitionerId?: string | null;
  initialClinicalServiceId?: string | null;
}

/** A picked calendar date rendered as the "YYYY-MM-DD" the form stores. */
function toDateKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

/** "2026-08-11" read back as a Date the calendar can highlight. */
function fromDateKey(dateKey: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return undefined;
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

/**
 * Direct entry for an appointment: the fields the appointments table shows, typed in one
 * pass. It skips the guided sheet's qualification steps and books the exact instant given,
 * which is what recording a call already agreed off-channel needs.
 */
export function QuickAppointmentDialog({
  open,
  onOpenChange,
  timezone,
  durationMinutes,
  initialScheduledAt = null,
  showPractitioner = false,
  showClinicalService = false,
  requiresPractitioner = false,
  initialPractitionerId = null,
  initialClinicalServiceId = null,
}: QuickAppointmentDialogProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const vocabulary = useLeadVocabulary();

  const { form, isBooking, handleSubmit, selectLead, clearLead } =
    useQuickAppointmentForm({
      isOpen: open,
      timezone,
      initialScheduledAt,
      initialPractitionerId,
      initialClinicalServiceId,
      requiresPractitioner,
      onBooked: () => onOpenChange(false),
    });

  // Only fetched for the verticals that show the pickers at all.
  const practitionersQuery = useInfinitePractitioners(
    { isActive: true },
    { enabled: open && showPractitioner },
  );
  const clinicalServicesQuery = useClinicalServices(
    {},
    { enabled: open && showClinicalService },
  );

  const practitionerOptions: AutoCompleteSelectOption[] = useMemo(
    () =>
      (practitionersQuery.data?.pages.flatMap((page) => page) ?? []).map(
        (practitioner) => ({
          id: practitioner.id,
          label: practitionerDisplayName(practitioner),
        }),
      ),
    [practitionersQuery.data],
  );

  const clinicalServiceOptions: AutoCompleteSelectOption[] = useMemo(
    () =>
      (clinicalServicesQuery.data ?? []).map((service) => ({
        id: service.id,
        label: service.name,
      })),
    [clinicalServicesQuery.data],
  );

  const selectedLeadId = useWatch({ control: form.control, name: "leadId" });
  const customerName = useWatch({
    control: form.control,
    name: "customerName",
  });
  const customerPhone = useWatch({
    control: form.control,
    name: "customerPhone",
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isBooking) onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[520px]">
        <DialogHeader className="px-5 py-4">
          <DialogTitle className="text-[15.5px] font-semibold">
            Add an appointment
          </DialogTitle>
          <DialogDescription className="text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
            Books the exact time you enter, in {timezone.replace("_", " ")} —
            your published availability is not enforced here.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="scroll flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto border-t border-[var(--line)] px-5 py-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover
                        open={isDatePickerOpen}
                        onOpenChange={setIsDatePickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isBooking}
                              className={cn(
                                "h-9 w-full justify-start px-3 text-[12.5px] font-normal",
                                !field.value && "text-[var(--ink-mute)]",
                              )}
                            >
                              <CalendarDays
                                size={14}
                                className="mr-2 text-[var(--ink-mute)]"
                              />
                              {field.value
                                ? fromDateKey(field.value)?.toLocaleDateString(
                                    "en-GB",
                                    {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    },
                                  )
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-auto p-0">
                          <Calendar
                            mode="single"
                            autoFocus
                            captionLayout="dropdown"
                            selected={fromDateKey(field.value)}
                            onSelect={(pickedDate) => {
                              if (!pickedDate) return;
                              field.onChange(toDateKey(pickedDate));
                              setIsDatePickerOpen(false);
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          disabled={isBooking}
                        />
                      </FormControl>
                      <FormDescription>
                        Runs for {durationMinutes} min.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(showPractitioner || showClinicalService) && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {showPractitioner && (
                    <FormField
                      control={form.control}
                      name="practitionerId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Doctor</FormLabel>
                          <FormControl>
                            <AutoCompleteSelect
                              items={practitionerOptions}
                              selected={
                                practitionerOptions.find(
                                  (option) => option.id === field.value,
                                ) ?? null
                              }
                              onSelect={(option) =>
                                field.onChange(option?.id ?? null)
                              }
                              placeholder="Search doctors"
                              emptyLabel="No practitioners yet"
                              disabled={isBooking}
                              className="h-9 text-[12.5px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {showClinicalService && (
                    <FormField
                      control={form.control}
                      name="clinicalServiceId"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>
                            Service
                            <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                              Optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <AutoCompleteSelect
                              items={clinicalServiceOptions}
                              selected={
                                clinicalServiceOptions.find(
                                  (option) => option.id === field.value,
                                ) ?? null
                              }
                              onSelect={(option) =>
                                field.onChange(option?.id ?? null)
                              }
                              placeholder="Search services"
                              emptyLabel="No services yet"
                              disabled={isBooking}
                              className="h-9 text-[12.5px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-[12.5px] font-medium text-[var(--ink)]">
                  {vocabulary.singularTitle}
                  <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
                    Optional
                  </span>
                </span>
                <LeadSelectField
                  selectedLeadId={selectedLeadId ?? null}
                  selectedLeadName={customerName ?? ""}
                  selectedLeadPhone={customerPhone ?? ""}
                  onSelect={selectLead}
                  onClear={clearLead}
                  disabled={isBooking}
                />
              </div>

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {vocabulary.customerSingularTitle} name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ayesha Khan"
                        disabled={isBooking}
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
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+92 300 1234567"
                        disabled={isBooking}
                        {...field}
                      />
                    </FormControl>
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
                        placeholder="Anything the team should know beforehand."
                        disabled={isBooking}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3.5">
              <Button
                type="button"
                variant="outline"
                disabled={isBooking}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBooking}>
                {isBooking && (
                  <Loader2 size={14} className="mr-1.5 animate-spin" />
                )}
                {isBooking ? "Adding…" : "Add appointment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
