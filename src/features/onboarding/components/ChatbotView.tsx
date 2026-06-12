'use client';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Bot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveChatbotSchema, type SaveChatbotData } from '../types';
import { useSaveChatbot, useOnboardingStatus } from '../hooks/useOnboarding';
import { OnboardingShell } from './OnboardingShell';

const PERSONALITIES = [
  { key: 'FORMAL' as const, label: 'Formal', desc: 'Professional & precise' },
  { key: 'CASUAL' as const, label: 'Casual', desc: 'Friendly & relaxed' },
  { key: 'PERSUASIVE' as const, label: 'Persuasive', desc: 'Confident & sales-driven' },
] as const;

/** Personalized starter messages seeded with the workspace name. */
function defaultMessages(workspace: string) {
  return {
    greetingMessage: `Hi! 👋 Welcome to ${workspace}. How can I help you today?`,
    escalationMessage: `Let me connect you with someone from the ${workspace} team — please hold on a moment.`,
    fallbackMessage: `Sorry, I didn't quite catch that. Could you rephrase it so I can help you better?`,
  };
}

export function ChatbotView() {
  const { mutate: save, isPending } = useSaveChatbot();
  const { data: status } = useOnboardingStatus();
  const workspaceName = status?.workspaceName?.trim();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<SaveChatbotData>({
    resolver: zodResolver(saveChatbotSchema),
    defaultValues: {
      ...defaultMessages(workspaceName || 'our store'),
      aiPersonality: 'CASUAL',
      aiEnabled: true,
    },
  });

  // Re-seed the messages with the real workspace name once it loads —
  // only while the owner hasn't started editing.
  useEffect(() => {
    if (workspaceName && !isDirty) {
      reset({
        ...defaultMessages(workspaceName),
        aiPersonality: 'CASUAL',
        aiEnabled: true,
      });
    }
  }, [workspaceName, isDirty, reset]);

  const aiEnabled = watch('aiEnabled');

  return (
    <OnboardingShell currentStep="CHATBOT">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">Configure your chatbot</h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">Set the messages your bot sends to customers</p>
      </div>

      <form onSubmit={handleSubmit((data) => save(data))} className="card p-6 flex flex-col gap-5">
        {/* AI toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-[var(--accent)]" />
              <span className="text-[13.5px] font-medium text-[var(--ink)]">AI-powered replies</span>
            </div>
            <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">
              Let AI respond automatically to common questions
            </p>
          </div>
          <Controller
            name="aiEnabled"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                role="switch"
                aria-checked={field.value}
                onClick={() => field.onChange(!field.value)}
                className={cn(
                  'relative w-[42px] h-[24px] rounded-full transition-colors flex-shrink-0',
                  field.value ? 'bg-[var(--accent)]' : 'bg-[var(--line)]',
                )}
              >
                <span className={cn(
                  'absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all',
                  field.value ? 'left-[21px]' : 'left-[3px]',
                )} />
              </button>
            )}
          />
        </div>

        {/* Personality selector */}
        {aiEnabled && (
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">AI Personality</label>
            <Controller
              name="aiPersonality"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {PERSONALITIES.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => field.onChange(p.key)}
                      className={cn(
                        'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
                        field.value === p.key
                          ? 'border-[var(--accent)] bg-[rgba(79,195,247,0.06)] shadow-sm'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]',
                      )}
                    >
                      <span className="text-[12.5px] font-medium text-[var(--ink)]">{p.label}</span>
                      <span className="text-[11px] text-[var(--ink-mute)] mt-0.5 leading-snug">{p.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        )}

        <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-3">
          {/* Greeting */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Greeting message</label>
            <textarea
              className="input text-[13px] min-h-[68px] resize-y"
              placeholder="Hi! How can I help you today?"
              {...register('greetingMessage')}
            />
            {errors.greetingMessage && (
              <p className="text-[11px] text-[var(--destructive)]">{errors.greetingMessage.message}</p>
            )}
          </div>

          {/* Escalation */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Escalation message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when handing off to a human agent</p>
            <textarea
              className="input text-[13px] min-h-[68px] resize-y"
              placeholder="Let me connect you with an agent…"
              {...register('escalationMessage')}
            />
            {errors.escalationMessage && (
              <p className="text-[11px] text-[var(--destructive)]">{errors.escalationMessage.message}</p>
            )}
          </div>

          {/* Fallback */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Fallback message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when the bot doesn't understand</p>
            <textarea
              className="input text-[13px] min-h-[68px] resize-y"
              placeholder="Sorry, I didn't understand. Could you rephrase?"
              {...register('fallbackMessage')}
            />
            {errors.fallbackMessage && (
              <p className="text-[11px] text-[var(--destructive)]">{errors.fallbackMessage.message}</p>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-grad w-full justify-center mt-1" disabled={isPending}>
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          {isPending ? 'Saving…' : 'Save & continue'}
        </button>
      </form>
    </OnboardingShell>
  );
}
