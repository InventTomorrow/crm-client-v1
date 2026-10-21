'use client';
import { AlertTriangle, Check, Info, Loader2, MessageCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { SettingsSaveBar } from '@/features/settings/components/SettingsSaveBar';
import { useLeadVocabulary } from '@/features/leads/utils/leadVocabulary';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { CRMSwitch } from '@/shared/ui/CRMSwitch';
import { Input } from '@/shared/ui/Input';
import { useFollowUpSettingsForm } from '../hooks/useFollowUpSettingsForm';
import { FOLLOW_UP_BOUNDS } from '../types';
import { FollowUpPriorityEditor } from './FollowUpPriorityEditor';

const ATTEMPT_OPTIONS = [1, 2, 3] as const;

function FieldError({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <p className="mt-2 text-[11px] text-[var(--destructive)]">{message}</p>;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h4 className="text-[12.5px] font-semibold text-[var(--ink)]">{title}</h4>
      <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">{description}</p>
    </div>
  );
}

// Same bordered row as the priority list, so both columns read as one system.
function SettingRow({
  label,
  labelFor,
  hint,
  control,
  children,
}: {
  label: string;
  labelFor?: string;
  hint: string;
  control: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <label htmlFor={labelFor} className="block text-[12.5px] font-medium text-[var(--ink)]">
            {label}
          </label>
          <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">{hint}</p>
        </div>
        {control}
      </div>
      {children}
    </div>
  );
}

// The unit sits inside the box and the spinner arrows are hidden: typing is faster than clicking.
function UnitNumberInput({ unit, className, ...inputProps }: ComponentProps<'input'> & { unit: string }) {
  return (
    <div className="relative w-32 shrink-0">
      <Input
        type="number"
        inputMode="numeric"
        className={cn(
          'pr-16 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className,
        )}
        {...inputProps}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-[var(--ink-mute)]">
        {unit}
      </span>
    </div>
  );
}

export function FollowUpSettingsCard() {
  const vocabulary = useLeadVocabulary();
  const {
    form,
    submit,
    isLoading,
    isSaving,
    isAvailable,
    areSettingsEditable,
    eligibleStatuses,
    numberAgeDays,
    highRiskDailyLimit,
    isHighRiskLimit,
    effectiveDailyLimit,
    isCappedByNumberAge,
  } = useFollowUpSettingsForm();
  const {
    register,
    control,
    formState: { errors, isDirty },
  } = form;

  if (isLoading || !isAvailable) return null;

  return (
    // noValidate: the browser's own min/max bubble would hide the form's clearer messages.
    <form noValidate onSubmit={submit} className="card p-[22px] flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold">
            <MessageCircle size={16} className="text-[var(--accent)]" /> Follow-ups
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
            Sends a short WhatsApp nudge to {vocabulary.plural} who go quiet after your reply. It
            stops as soon as they reply, book or ask to stop, and never messages cold, booked or
            closed {vocabulary.plural}.
          </p>
        </div>
        <Controller
          name="enabled"
          control={control}
          render={({ field }) => <CRMSwitch on={field.value} onChange={field.onChange} size="md" />}
        />
      </div>

      {!areSettingsEditable && (
        <p className="-mt-2 text-[11.5px] text-[var(--ink-mute)]">
          Turn follow-ups on to change these settings.
        </p>
      )}

      {/* A disabled fieldset locks every control inside, including the priority checkboxes and arrows. */}
      <fieldset
        disabled={!areSettingsEditable}
        className="m-0 grid min-w-0 grid-cols-1 gap-6 border-0 p-0 transition-opacity disabled:opacity-50 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-2">
          <SectionHeading
            title="When to follow up"
            description="Timing, how many to send, and a safe daily cap for your number."
          />

          <SettingRow
            label="Wait before following up"
            labelFor="follow-up-interval"
            hint="Silence after your reply. Each later follow-up waits twice as long."
            control={
              <UnitNumberInput
                id="follow-up-interval"
                unit="hours"
                min={FOLLOW_UP_BOUNDS.intervalHours.min}
                max={FOLLOW_UP_BOUNDS.intervalHours.max}
                aria-invalid={!!errors.intervalHours}
                {...register('intervalHours', { valueAsNumber: true })}
              />
            }
          >
            <FieldError message={errors.intervalHours?.message} />
          </SettingRow>

          <SettingRow
            label="Follow-ups per conversation"
            hint="The last one closes politely."
            control={
              <Controller
                name="maxAttempts"
                control={control}
                render={({ field }) => (
                  <div className="seg shrink-0" role="group" aria-label="Follow-ups per conversation">
                    {ATTEMPT_OPTIONS.map((attemptCount) => (
                      <button
                        key={attemptCount}
                        type="button"
                        aria-pressed={field.value === attemptCount}
                        className={cn('min-w-9', field.value === attemptCount && 'on')}
                        onClick={() => field.onChange(attemptCount)}
                      >
                        {attemptCount}
                      </button>
                    ))}
                  </div>
                )}
              />
            }
          />

          <SettingRow
            label="Daily limit for your number"
            labelFor="follow-up-daily-limit"
            hint={`Between ${FOLLOW_UP_BOUNDS.dailyLimit.min} and ${FOLLOW_UP_BOUNDS.dailyLimit.max} follow-ups a day.`}
            control={
              <UnitNumberInput
                id="follow-up-daily-limit"
                unit="a day"
                min={FOLLOW_UP_BOUNDS.dailyLimit.min}
                max={FOLLOW_UP_BOUNDS.dailyLimit.max}
                aria-invalid={!!errors.dailyLimit}
                {...register('dailyLimit', { valueAsNumber: true })}
              />
            }
          >
            <FieldError message={errors.dailyLimit?.message} />
            {isHighRiskLimit && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--warning-soft)] p-2.5 text-[11.5px] text-[var(--warning-foreground)]">
                <AlertTriangle size={14} className="mt-px shrink-0" />
                <span>
                  More than {highRiskDailyLimit} a day raises the risk of WhatsApp banning your number.
                  You can still save it, but keep it lower unless the number is well established.
                </span>
              </div>
            )}
            {isCappedByNumberAge && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-[var(--surface-2)] p-2.5 text-[11.5px] text-[var(--ink-mute)]">
                <Info size={14} className="mt-px shrink-0" />
                <span>
                  This number connected {numberAgeDays} {numberAgeDays === 1 ? 'day' : 'days'} ago, so at
                  most {effectiveDailyLimit} a day go out for now. The cap rises as the number ages.
                </span>
              </div>
            )}
          </SettingRow>
        </div>

        {/* Stacks under the settings on narrow screens */}
        <div className="flex flex-col gap-2 border-t border-[var(--line)] pt-5 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
          <SectionHeading
            title="Who gets follow-ups first"
            description="When the daily limit is reached, the top of this list goes first. Untick a status to skip it."
          />
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <FollowUpPriorityEditor
                priority={field.value}
                eligibleStatuses={eligibleStatuses}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError message={errors.priority?.message ?? errors.priority?.root?.message} />
        </div>
      </fieldset>

      <SettingsSaveBar variant="inset">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Saving…
            </>
          ) : (
            <>
              <Check size={14} /> Save follow-ups
            </>
          )}
        </Button>
      </SettingsSaveBar>
    </form>
  );
}
