'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bot, Check, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { useChatbotConfig, useUpdateChatbotConfig } from '../hooks/useChatbotSettings';
import { chatbotConfigSchema, type ChatbotConfigForm } from '../types';

const PERSONALITIES = [
  { key: 'FORMAL' as const, label: 'Formal', desc: 'Professional & precise' },
  { key: 'CASUAL' as const, label: 'Casual', desc: 'Friendly & relaxed' },
  { key: 'PERSUASIVE' as const, label: 'Persuasive', desc: 'Confident & sales-driven' },
];

const DEFAULTS: ChatbotConfigForm = {
  greetingMessage: '',
  escalationMessage: '',
  fallbackMessage: '',
  aiPersonality: 'CASUAL',
  aiEnabled: true,
};

export function ChatbotSection() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: save, isPending } = useUpdateChatbotConfig();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ChatbotConfigForm>({
    resolver: zodResolver(chatbotConfigSchema),
    defaultValues: DEFAULTS,
  });

  // Hydrate the form once the saved config arrives.
  useEffect(() => {
    if (data?.config) {
      reset({
        greetingMessage: data.config.greetingMessage,
        escalationMessage: data.config.escalationMessage,
        fallbackMessage: data.config.fallbackMessage,
        aiPersonality: data.config.aiPersonality,
        aiEnabled: data.config.aiEnabled,
      });
    }
  }, [data, reset]);

  const aiEnabled = watch('aiEnabled');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Chatbot</h2>
      <form onSubmit={handleSubmit((d) => save(d, { onSuccess: () => reset(d) }))} className="card p-[22px] flex flex-col gap-5">
        {/* AI toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-[var(--accent)]" />
              <span className="text-[13.5px] font-medium text-[var(--ink)]">AI-powered replies</span>
            </div>
            <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">Let AI respond automatically to common questions</p>
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

        {/* Personality */}
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
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm'
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
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Greeting message</label>
            <textarea className="input text-[13px] min-h-[68px] resize-y" {...register('greetingMessage')} />
            {errors.greetingMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.greetingMessage.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Escalation message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when handing off to a human agent</p>
            <textarea className="input text-[13px] min-h-[68px] resize-y" {...register('escalationMessage')} />
            {errors.escalationMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.escalationMessage.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Fallback message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when the bot doesn&apos;t understand</p>
            <textarea className="input text-[13px] min-h-[68px] resize-y" {...register('fallbackMessage')} />
            {errors.fallbackMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.fallbackMessage.message}</p>}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-grad" disabled={isPending || !isDirty}>
            {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save changes</>}
          </button>
        </div>
      </form>
    </>
  );
}
