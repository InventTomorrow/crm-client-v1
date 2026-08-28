"use client";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
import { useFormWizard } from "@/shared/hooks/useFormWizard";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/ui/Sheet";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useManualBookingForm } from "../hooks/useManualBookingForm";
import { manualBookingSteps } from "../utils/manualBookingSteps";
import { BookingAnswersStep } from "./steps/BookingAnswersStep";
import { BookingConfirmStep } from "./steps/BookingConfirmStep";
import { BookingLeadStep } from "./steps/BookingLeadStep";
import { BookingSlotStep } from "./steps/BookingSlotStep";

const DEFAULT_TIMEZONE = "Asia/Karachi";
const DEFAULT_DURATION_MINUTES = 30;

interface BookAppointmentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Booking taken by a person rather than the bot: for a call the owner made, or a lead
 * who reached them off-channel. It walks the same ground a bot conversation covers —
 * who, what they said, when — so a manual booking lands in the CRM as complete as one
 * the bot took.
 */
export function BookAppointmentSheet({
  open,
  onOpenChange,
}: BookAppointmentSheetProps) {
  const {
    form,
    questions,
    config,
    availability,
    isLoadingAvailability,
    isLoadingAnswers,
    isBooking,
    handleSubmit,
    resetForm,
  } = useManualBookingForm({
    isOpen: open,
    onBooked: () => onOpenChange(false),
  });

  const vocabulary = useLeadVocabulary();
  const steps = useMemo(() => manualBookingSteps(vocabulary), [vocabulary]);

  // Sequential: each step narrows the next, and the owner has nothing to jump back to
  // until a lead is chosen.
  const wizard = useFormWizard({
    form,
    steps,
    navigation: "sequential",
    gateSubmitOnCompletion: true,
  });

  const { activeStep } = wizard;
  const timezone =
    availability?.timezone ?? config?.timezone ?? DEFAULT_TIMEZONE;
  const durationMinutes =
    availability?.durationMinutes ??
    config?.durationMinutes ??
    DEFAULT_DURATION_MINUTES;

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[560px]"
      >
        <SheetHeader className="border-b border-[var(--line)] px-5 py-4">
          <SheetTitle>Book {vocabulary.bookingSingularWithArticle}</SheetTitle>
          <SheetDescription>
            For {vocabulary.bookingSingularWithArticle} you took yourself. Times
            read in {timezone.replace("_", " ")}.
          </SheetDescription>
        </SheetHeader>

        {/* Step rail — compact enough to sit inside a sheet, unlike the full page wizard nav */}
        <ol className="flex shrink-0 items-center gap-1 border-b border-[var(--line)] px-5 py-3">
          {wizard.stepStates.map(
            ({ step, index, isComplete, isActive, isReachable }) => (
              <li
                key={step.id}
                className="flex min-w-0 flex-1 items-center gap-1.5"
              >
                <button
                  type="button"
                  disabled={!isReachable || isBooking}
                  onClick={() => wizard.goToStep(index)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]"
                      : isComplete
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-[var(--line)] text-[var(--ink-mute)]",
                    isReachable
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50",
                  )}
                >
                  {isComplete && !isActive ? <Check size={11} /> : index + 1}
                </button>
                <span
                  className={cn(
                    "truncate text-[11px]",
                    isActive
                      ? "font-medium text-[var(--ink)]"
                      : "text-[var(--ink-mute)]",
                  )}
                >
                  {step.label}
                </span>
              </li>
            ),
          )}
        </ol>

        <Form {...form}>
          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="scroll flex-1 overflow-y-auto px-5 py-5">
              <div className="mb-4">
                <h3 className="text-[13.5px] font-semibold text-[var(--ink)]">
                  {activeStep.title}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-[var(--ink-mute)]">
                  {activeStep.description}
                </p>
              </div>

              {activeStep.id === "lead" && (
                <BookingLeadStep form={form} disabled={isBooking} />
              )}

              {activeStep.id === "answers" && (
                <BookingAnswersStep
                  form={form}
                  questions={questions}
                  isLoading={isLoadingAnswers}
                  disabled={isBooking}
                />
              )}

              {activeStep.id === "slot" && (
                <BookingSlotStep
                  form={form}
                  availability={availability}
                  timezone={timezone}
                  isLoadingAvailability={isLoadingAvailability}
                  disabled={isBooking}
                />
              )}

              {activeStep.id === "confirm" && (
                <BookingConfirmStep
                  form={form}
                  questions={questions}
                  timezone={timezone}
                  durationMinutes={durationMinutes}
                  disabled={isBooking}
                />
              )}
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[var(--line)] px-5 py-3">
              {!wizard.isFirstStep && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBooking}
                  onClick={wizard.goToPreviousStep}
                  className="mr-auto"
                >
                  <ArrowLeft size={14} className="mr-1.5" /> Back
                </Button>
              )}

              {wizard.isLastStep ? (
                <Button type="submit" disabled={isBooking || !wizard.canSubmit}>
                  {isBooking ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" />{" "}
                      Booking…
                    </>
                  ) : (
                    "Book appointment"
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled={isBooking}
                  onClick={wizard.goToNextStep}
                >
                  Next
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
