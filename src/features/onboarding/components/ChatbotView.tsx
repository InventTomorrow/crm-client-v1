'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Bot, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveChatbotSchema, type SaveChatbotData } from '../types';
import { useSaveChatbot, useOnboardingStatus } from '../hooks/useOnboarding';
import { getDefaultMessages } from '../utils/defaultMessages';
import { OnboardingShell } from './OnboardingShell';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { Switch } from '@/shared/ui/Switch';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

const PERSONALITIES = [
  { key: 'FORMAL' as const, label: 'Formal', desc: 'Professional & precise' },
  { key: 'CASUAL' as const, label: 'Casual', desc: 'Friendly & relaxed' },
  { key: 'PERSUASIVE' as const, label: 'Persuasive', desc: 'Confident & sales-driven' },
] as const;

export function ChatbotView() {
  const { mutate: save, isPending } = useSaveChatbot();
  const { data: status } = useOnboardingStatus();
  // The bot speaks to customers, so it introduces the business — not the workspace.
  const businessName = status?.businessName?.trim();
  const businessVertical = status?.businessVertical ?? 'ECOMMERCE';

  const form = useForm<SaveChatbotData>({
    resolver: zodResolver(saveChatbotSchema),
    defaultValues: {
      ...getDefaultMessages(businessName || 'our store', businessVertical),
      aiPersonality: 'CASUAL',
      aiEnabled: true,
    },
  });

  const { isDirty } = form.formState;

  // Re-seed the messages with the real business name + vertical once they load —
  // only while the owner hasn't started editing.
  useEffect(() => {
    if (businessName && !isDirty) {
      form.reset({
        ...getDefaultMessages(businessName, businessVertical),
        aiPersonality: 'CASUAL',
        aiEnabled: true,
      });
    }
  }, [businessName, businessVertical, isDirty, form]);

  const aiEnabled = form.watch('aiEnabled');

  return (
    <OnboardingShell currentStep="CHATBOT">
      <div className="mb-6 text-center">
        <h1 className="text-[22px] font-semibold text-[var(--ink)]">Configure your chatbot</h1>
        <p className="text-[13px] mt-1 text-[var(--ink-mute)]">Set the messages your bot sends to customers</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => save(data))} className="card p-6 flex flex-col gap-5">

          {/* AI toggle */}
          <FormField
            control={form.control}
            name="aiEnabled"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between py-1 space-y-0">
                <div>
                  <FormLabel className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--ink)] mb-0">
                    <Bot size={15} className="text-[var(--accent)]" />
                    AI-powered replies
                  </FormLabel>
                  <p className="text-[12px] text-[var(--ink-mute)] mt-0.5">
                    Let AI respond automatically to common questions
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Personality selector */}
          {aiEnabled && (
            <FormField
              control={form.control}
              name="aiPersonality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">AI Personality</FormLabel>
                  <FormControl>
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="border-t border-[var(--line)] pt-4 flex flex-col gap-3">
            {/* Greeting */}
            <FormField
              control={form.control}
              name="greetingMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">Greeting message</FormLabel>
                  <FormControl>
                    <Textarea
                      className="text-[13px] min-h-[68px] resize-y"
                      placeholder="Hi! How can I help you today?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Escalation */}
            <FormField
              control={form.control}
              name="escalationMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">Escalation message</FormLabel>
                  <p className="text-[11px] text-[var(--ink-mute)] -mt-1">Sent when handing off to a human agent</p>
                  <FormControl>
                    <Textarea
                      className="text-[13px] min-h-[68px] resize-y"
                      placeholder="Let me connect you with an agent…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fallback */}
            <FormField
              control={form.control}
              name="fallbackMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">Fallback message</FormLabel>
                  <p className="text-[11px] text-[var(--ink-mute)] -mt-1">Sent when the bot doesn&apos;t understand</p>
                  <FormControl>
                    <Textarea
                      className="text-[13px] min-h-[68px] resize-y"
                      placeholder="Sorry, I didn't understand. Could you rephrase?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="lg" className="w-full justify-center mt-1" disabled={isPending}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            {isPending ? 'Saving…' : 'Save & continue'}
          </Button>
        </form>
      </Form>
    </OnboardingShell>
  );
}
