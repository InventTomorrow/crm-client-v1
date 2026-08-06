'use client';
import type { QualificationQuestionFormData } from '@/features/qualification/types';
import { FormControl, FormField, FormItem, FormLabel } from '@/shared/ui/form';
import { Input } from '@/shared/ui/Input';
import { NativeSelect } from '@/shared/ui/NativeSelect';
import { Skeleton } from '@/shared/ui/Skeleton';
import type { UseFormReturn } from 'react-hook-form';
import type { ManualBookingFormData, ManualBookingFormInput } from '../../types';

interface BookingAnswersStepProps {
  form: UseFormReturn<ManualBookingFormInput, unknown, ManualBookingFormData>;
  questions: QualificationQuestionFormData[];
  isLoading?: boolean;
  disabled?: boolean;
}

/** Maps a question's answer type onto the input the owner types into. */
function inputTypeFor(question: QualificationQuestionFormData): 'number' | 'email' | 'text' {
  if (question.inputType === 'NUMBER') return 'number';
  if (question.inputType === 'EMAIL') return 'email';
  return 'text';
}

/**
 * The workspace's own bot questions, answered by the owner on the lead's behalf. Posted
 * through the same endpoint the bot uses, so scoring, lead-field mapping and resource
 * targeting all behave as if the lead had answered in chat.
 */
export function BookingAnswersStep({
  form,
  questions,
  isLoading = false,
  disabled = false,
}: BookingAnswersStepProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--line)] px-3 py-6 text-center text-[12px] text-[var(--ink-mute)]">
        No bot questions set up yet, so there is nothing to capture here. Booking still works.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((question) => (
        <FormField
          key={question.fieldName}
          control={form.control}
          name={`answers.${question.fieldName}`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{question.questionText}</FormLabel>
              <FormControl>
                {question.inputType === 'QUICK_REPLY' ? (
                  <NativeSelect
                    size="lg"
                    disabled={disabled}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                  >
                    <option value="">Not answered</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <Input
                    type={inputTypeFor(question)}
                    placeholder="Leave blank to skip"
                    disabled={disabled}
                    {...field}
                    value={field.value ?? ''}
                  />
                )}
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
