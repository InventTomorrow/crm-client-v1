'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Plus, Zap, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  useChatbotConfig,
  useGenerateBusinessIntro,
  useUpdateBusinessProfile,
} from '../hooks/useChatbotSettings';
import { businessProfileSchema, type BusinessProfileForm } from '../types';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';

const DEFAULTS: BusinessProfileForm = {
  businessDescription: '',
  businessInfoMessage: '',
  businessFaqs: [],
  supportName: '',
  supportPhone: '',
  supportEmail: '',
};

export function BusinessSection() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: save, isPending } = useUpdateBusinessProfile();
  const { mutate: generate, isPending: isGenerating } = useGenerateBusinessIntro();

  const form = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'businessFaqs',
  });

  useEffect(() => {
    if (data?.config) {
      form.reset({
        businessDescription: data.config.businessDescription ?? '',
        businessInfoMessage: data.config.businessInfoMessage ?? '',
        businessFaqs: data.config.businessFaqs ?? [],
        supportName: data.config.supportName ?? '',
        supportPhone: data.config.supportPhone ?? '',
        supportEmail: data.config.supportEmail ?? '',
      });
    }
  }, [data, form]);

  const description = form.watch('businessDescription');

  const handleGenerate = () => {
    const desc = (form.getValues('businessDescription') ?? '').trim();
    if (desc.length < 10) return;
    generate(desc, {
      onSuccess: (message) =>
        form.setValue('businessInfoMessage', message, { shouldDirty: true }),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[20px] font-semibold">Business</h2>
      <p className="text-[12.5px] text-[var(--ink-mute)] -mt-2">
        Describe your business and add common Q&amp;A — the chatbot uses these to answer questions about you.
      </p>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => save(d, { onSuccess: () => form.reset(d) }))}
          className="flex flex-col gap-3.5"
        >
          {/* Description + generate */}
          <div className="card p-[22px] flex flex-col gap-3">
            <FormField
              control={form.control}
              name="businessDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What does your business do?</FormLabel>
                  <FormControl>
                    <Textarea
                      className="min-h-[80px] resize-y"
                      placeholder="e.g. We're a Karachi-based boutique selling handmade lawn suits and accessories, with nationwide COD delivery."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <div>
                <FormLabel className="text-[12px] font-medium text-[var(--ink-soft)]">
                  Intro message
                </FormLabel>
                <p className="text-[11px] text-[var(--ink-mute)]">
                  Shown when a customer asks about your business. Generate, then edit freely.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0"
                onClick={handleGenerate}
                disabled={isGenerating || (description ?? '').trim().length < 10}
              >
                {isGenerating ? (
                  <><Loader2 size={13} className="animate-spin" /> Generating…</>
                ) : (
                  <><Zap size={13} /> Generate with AI</>
                )}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="businessInfoMessage"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="min-h-[96px] resize-y"
                      placeholder="Your business intro will appear here — or write your own."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Q&A editor */}
          <div className="card p-[22px] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[13.5px] font-semibold">Custom Q&amp;A</h4>
                <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                  Question → answer pairs the bot can use directly.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ question: '', answer: '' })}
              >
                <Plus size={13} /> Add
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-[12px] text-[var(--ink-mute)] py-2">
                No Q&amp;A yet. Add a pair like &ldquo;Do you deliver? → Yes, nationwide COD.&rdquo;
              </p>
            )}

            {fields.map((field, i) => (
              <div
                key={field.id}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 flex flex-col gap-2"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    <FormField
                      control={form.control}
                      name={`businessFaqs.${i}.question`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Question" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`businessFaqs.${i}.answer`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              className="min-h-[56px] resize-y"
                              placeholder="Answer"
                              {...f}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove"
                    className="text-[var(--ink-mute)] hover:text-destructive mt-1"
                    onClick={() => remove(i)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Support contact */}
          <div className="card p-[22px] flex flex-col gap-3">
            <div>
              <h4 className="text-[13.5px] font-semibold">Support Contact</h4>
              <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">
                The AI uses these details when directing customers to support (e.g. blocked cancellations, shipped orders).
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="supportName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team / Person name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Support Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp / Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="+92 300 0000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="support@yourbusiness.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending || !form.formState.isDirty}>
              {isPending ? (
                <><Loader2 size={13} className="animate-spin" /> Saving…</>
              ) : (
                <><Check size={14} /> Save changes</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
