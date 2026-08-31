"use client";
import { useLeadVocabulary } from "@/features/leads/utils/leadVocabulary";
import type { QualificationQuestionFormData } from "@/features/qualification/types";
import { Badge } from "@/shared/ui/Badge";
import { FormControl, FormField, FormItem, FormLabel } from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/Textarea";
import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import type {
  ManualBookingFormData,
  ManualBookingFormInput,
} from "../../types";
import { formatAppointmentSlot } from "../../utils/appointmentFormat";

interface BookingConfirmStepProps {
  form: UseFormReturn<ManualBookingFormInput, unknown, ManualBookingFormData>;
  questions: QualificationQuestionFormData[];
  timezone: string;
  durationMinutes: number;
  disabled?: boolean;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-[12px] text-[var(--ink-mute)]">
        {label}
      </span>
      <span className="min-w-0 text-right text-[12.5px] font-medium text-[var(--ink)]">
        {value}
      </span>
    </div>
  );
}

export function BookingConfirmStep({
  form,
  questions,
  timezone,
  durationMinutes,
  disabled = false,
}: BookingConfirmStepProps) {
  const booking = useWatch({ control: form.control });
  const vocabulary = useLeadVocabulary();

  const answers = booking.answers ?? {};
  const answeredQuestions = questions.filter((question) =>
    (answers[question.fieldName] ?? "").toString().trim(),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-2">
        <SummaryRow
          label={vocabulary.singularTitle}
          value={booking.customerName || `Unnamed ${vocabulary.singular}`}
        />
        <SummaryRow label="Contact" value={booking.customerPhone || "—"} />
        <SummaryRow
          label="When"
          value={
            booking.scheduledAt
              ? formatAppointmentSlot(booking.scheduledAt, timezone)
              : "Not picked"
          }
        />
        <SummaryRow label="Length" value={`${durationMinutes} min`} />
      </div>

      {booking.isCustomTime && (
        <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-2.5 text-[11.5px] text-[var(--ink-mute)]">
          This time sits outside your configured hours, so the bot would never
          have offered it. It is still checked against everything already
          booked.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-[12.5px] font-medium text-[var(--ink)]">
          Answers captured
          <Badge variant="secondary" className="ml-2 text-[10px]">
            {answeredQuestions.length} of {questions.length}
          </Badge>
        </p>
        {answeredQuestions.length === 0 ? (
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            None — the {vocabulary.singular} keeps whatever score they already
            had.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {answeredQuestions.map((question) => (
              <li
                key={question.fieldName}
                className="text-[11.5px] text-[var(--ink-mute)]"
              >
                <span className="text-[var(--ink)]">
                  {question.questionText}
                </span>{" "}
                — {answers[question.fieldName]}
              </li>
            ))}
          </ul>
        )}
      </div>

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
                rows={3}
                placeholder="Wants to discuss the retainer package."
                disabled={disabled}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
