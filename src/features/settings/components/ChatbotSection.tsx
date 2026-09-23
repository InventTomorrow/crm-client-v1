'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AISettingsWidget } from '@/features/channels/whatsapp/components/AISettingsWidget';
import { KEEP_FIELD_REFS } from '@/lib/formReset';
import { cn } from '@/lib/utils';
import { useChatbotConfig, useUpdateChatbotConfig } from '../hooks/useChatbotSettings';
import { chatbotConfigSchema, type ChatbotConfigForm } from '../types';
import { SettingsSaveBar } from './SettingsSaveBar';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';

const PERSONALITIES = [
  { key: 'FORMAL' as const, label: 'Formal', desc: 'Professional & precise' },
  { key: 'CASUAL' as const, label: 'Casual', desc: 'Friendly & relaxed' },
  { key: 'PERSUASIVE' as const, label: 'Persuasive', desc: 'Confident & sales-driven' },
];

const REPLY_LANGUAGES = [
  { key: 'MATCH_CUSTOMER' as const, label: 'Match customer', desc: "Replies in the customer's language" },
  { key: 'ENGLISH' as const, label: 'English', desc: 'Always replies in English' },
  { key: 'ROMAN_URDU' as const, label: 'Roman Urdu', desc: 'e.g. "Aap ka order mil gaya hai"' },
];

const DEFAULTS: ChatbotConfigForm = {
  greetingMessage: '',
  escalationMessage: '',
  fallbackMessage: '',
  aiPersonality: 'CASUAL',
  replyLanguage: 'MATCH_CUSTOMER',
};

export function ChatbotSection() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: save, isPending } = useUpdateChatbotConfig();

  const {
    register,
    handleSubmit,
    control,
    reset,
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
        replyLanguage: data.config.replyLanguage ?? 'MATCH_CUSTOMER',
      }, KEEP_FIELD_REFS);
    }
  }, [data, reset]);

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
      <form
        data-tour="settings-chatbot"
        onSubmit={handleSubmit((d) => save(d, { onSuccess: () => reset(d, KEEP_FIELD_REFS) }))}
        className="card p-[22px] flex flex-col gap-5"
      >
        {/* Personality */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[var(--ink-soft)]">AI Personality</label>
          <Controller
            name="aiPersonality"
            control={control}
            render={({ field }) => (
              <OptionGrid options={PERSONALITIES} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Reply language */}
        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-medium text-[var(--ink-soft)]">Reply language</label>
          <Controller
            name="replyLanguage"
            control={control}
            render={({ field }) => (
              <OptionGrid options={REPLY_LANGUAGES} value={field.value} onChange={field.onChange} />
            )}
          />
          <p className="text-[11px] text-[var(--ink-mute)]">
            Applies to the assistant&apos;s replies. The greeting, escalation and fallback messages
            below are sent exactly as written — write them in the same language.
          </p>
        </div>

        <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Greeting message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when a customer starts a new conversation</p>
            <Textarea className="text-[13px] min-h-[68px] resize-y" {...register('greetingMessage')} />
            {errors.greetingMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.greetingMessage.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Escalation message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when handing off to a human agent</p>
            <Textarea className="text-[13px] min-h-[68px] resize-y" {...register('escalationMessage')} />
            {errors.escalationMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.escalationMessage.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">Fallback message</label>
            <p className="text-[11px] text-[var(--ink-mute)]">Sent when the bot doesn&apos;t understand</p>
            <Textarea className="text-[13px] min-h-[68px] resize-y" {...register('fallbackMessage')} />
            {errors.fallbackMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.fallbackMessage.message}</p>}
          </div>
        </div>

        <SettingsSaveBar variant="inset">
          <Button type="submit" disabled={isPending || !isDirty}>
            {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Check size={14} /> Save changes</>}
          </Button>
        </SettingsSaveBar>
      </form>

      <AISettingsWidget />
    </>
  );
}

function OptionGrid<TKey extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: TKey; label: string; desc: string }[];
  value: TKey;
  onChange: (key: TKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            'flex flex-col items-start p-3 rounded-xl border text-left transition-all',
            value === option.key
              ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm'
              : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]',
          )}
        >
          <span className="text-[12.5px] font-medium text-[var(--ink)]">{option.label}</span>
          <span className="text-[11px] text-[var(--ink-mute)] mt-0.5 leading-snug">{option.desc}</span>
        </button>
      ))}
    </div>
  );
}
