'use client';
import { AlertTriangle, Check, Info, Loader2, MessageCircle } from 'lucide-react';
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
  return <p className="text-[11px] text-[var(--destructive)]">{message}</p>;
}

export function FollowUpSettingsCard() {
  const vocabulary = useLeadVocabulary();
  const {
    form,
    submit,
    isLoading,
    isSaving,
    isAvailable,
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
    <form onSubmit={submit} className="card p-[22px] flex flex-col gap-5">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="follow-up-interval" className="text-[12px] font-medium text-[var(--ink-soft)]">
            Wait before following up
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="follow-up-interval"
              type="number"
              min={FOLLOW_UP_BOUNDS.intervalHours.min}
              max={FOLLOW_UP_BOUNDS.intervalHours.max}
              className="w-24"
              {...register('intervalHours', { valueAsNumber: true })}
            />
            <span className="text-[12px] text-[var(--ink-mute)]">hours of silence</span>
          </div>
          <p className="text-[11px] text-[var(--ink-mute)]">Each later follow-up waits twice as long.</p>
          <FieldError message={errors.intervalHours?.message} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-medium text-[var(--ink-soft)]">Follow-ups per conversation</span>
          <Controller
            name="maxAttempts"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {ATTEMPT_OPTIONS.map((attemptCount) => (
                  <button
                    key={attemptCount}
                    type="button"
                    onClick={() => field.onChange(attemptCount)}
                    className={cn(
                      'h-10 w-12 rounded-xl border text-[13px] font-medium transition-all',
                      field.value === attemptCount
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-mute)] hover:border-[var(--accent)]',
                    )}
                  >
                    {attemptCount}
                  </button>
                ))}
              </div>
            )}
          />
          <p className="text-[11px] text-[var(--ink-mute)]">The last one closes politely.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="follow-up-daily-limit" className="text-[12px] font-medium text-[var(--ink-soft)]">
          Daily limit for your number
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="follow-up-daily-limit"
            type="number"
            min={FOLLOW_UP_BOUNDS.dailyLimit.min}
            max={FOLLOW_UP_BOUNDS.dailyLimit.max}
            className="w-24"
            {...register('dailyLimit', { valueAsNumber: true })}
          />
          <span className="text-[12px] text-[var(--ink-mute)]">
            follow-ups a day ({FOLLOW_UP_BOUNDS.dailyLimit.min}–{FOLLOW_UP_BOUNDS.dailyLimit.max})
          </span>
        </div>
        <FieldError message={errors.dailyLimit?.message} />
        {isHighRiskLimit && (
          <div className="mt-1 flex items-start gap-2 rounded-xl bg-[var(--warning-soft)] p-3 text-[11.5px] text-[var(--warning-foreground)]">
            <AlertTriangle size={14} className="mt-px flex-shrink-0" />
            <span>
              More than {highRiskDailyLimit} a day raises the risk of WhatsApp banning your number.
              You can still save it, but keep it lower unless the number is well established.
            </span>
          </div>
        )}
        {isCappedByNumberAge && (
          <div className="mt-1 flex items-start gap-2 rounded-xl bg-[var(--surface-2)] p-3 text-[11.5px] text-[var(--ink-mute)]">
            <Info size={14} className="mt-px flex-shrink-0" />
            <span>
              This number connected {numberAgeDays} {numberAgeDays === 1 ? 'day' : 'days'} ago, so at
              most {effectiveDailyLimit} a day go out for now. The cap rises as the number ages.
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div>
          <span className="text-[12px] font-medium text-[var(--ink-soft)]">Who gets follow-ups first</span>
          <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">
            When the daily limit is reached, the top of this list goes first. Untick a status to skip it.
          </p>
        </div>
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
