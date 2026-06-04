'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  useChatbotConfig,
  useGenerateBusinessIntro,
  useUpdateBusinessProfile,
} from '../hooks/useChatbotSettings';
import { businessProfileSchema, type BusinessProfileForm } from '../types';

const DEFAULTS: BusinessProfileForm = {
  businessDescription: '',
  businessInfoMessage: '',
  businessFaqs: [],
};

export function BusinessSection() {
  const { data, isLoading } = useChatbotConfig();
  const { mutate: save, isPending } = useUpdateBusinessProfile();
  const { mutate: generate, isPending: isGenerating } = useGenerateBusinessIntro();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BusinessProfileForm>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'businessFaqs' });

  useEffect(() => {
    if (data?.config) {
      reset({
        businessDescription: data.config.businessDescription ?? '',
        businessInfoMessage: data.config.businessInfoMessage ?? '',
        businessFaqs: data.config.businessFaqs ?? [],
      });
    }
  }, [data, reset]);

  const description = watch('businessDescription');

  const handleGenerate = () => {
    const desc = (getValues('businessDescription') ?? '').trim();
    if (desc.length < 10) return;
    generate(desc, {
      onSuccess: (message) => setValue('businessInfoMessage', message, { shouldDirty: true }),
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

      <form onSubmit={handleSubmit((d) => save(d, { onSuccess: () => reset(d) }))} className="flex flex-col gap-3.5">
        {/* Description + generate */}
        <div className="card p-[22px] flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[var(--ink-soft)]">What does your business do?</label>
            <textarea
              className="input text-[13px] min-h-[80px] resize-y"
              placeholder="e.g. We're a Karachi-based boutique selling handmade lawn suits and accessories, with nationwide COD delivery."
              {...register('businessDescription')}
            />
            {errors.businessDescription && <p className="text-[11px] text-[var(--destructive)]">{errors.businessDescription.message}</p>}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
            <div>
              <label className="text-[12px] font-medium text-[var(--ink-soft)]">Intro message</label>
              <p className="text-[11px] text-[var(--ink-mute)]">Shown when a customer asks about your business. Generate, then edit freely.</p>
            </div>
            <button
              type="button"
              className="btn btn-outline flex-shrink-0"
              onClick={handleGenerate}
              disabled={isGenerating || (description ?? '').trim().length < 10}
            >
              {isGenerating ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><Sparkles size={13} /> Generate with AI</>}
            </button>
          </div>
          <textarea
            className="input text-[13px] min-h-[96px] resize-y"
            placeholder="Your business intro will appear here — or write your own."
            {...register('businessInfoMessage')}
          />
          {errors.businessInfoMessage && <p className="text-[11px] text-[var(--destructive)]">{errors.businessInfoMessage.message}</p>}
        </div>

        {/* Q&A editor */}
        <div className="card p-[22px] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-[13.5px] font-semibold">Custom Q&amp;A</h4>
              <p className="text-[11px] text-[var(--ink-mute)] mt-0.5">Question → answer pairs the bot can use directly.</p>
            </div>
            <button type="button" className="btn btn-outline py-1 px-2.5 text-[12px]" onClick={() => append({ question: '', answer: '' })}>
              <Plus size={13} /> Add
            </button>
          </div>

          {fields.length === 0 && (
            <p className="text-[12px] text-[var(--ink-mute)] py-2">No Q&amp;A yet. Add a pair like &ldquo;Do you deliver? → Yes, nationwide COD.&rdquo;</p>
          )}

          {fields.map((field, i) => (
            <div key={field.id} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    className="input text-[13px]"
                    placeholder="Question"
                    {...register(`businessFaqs.${i}.question` as const)}
                  />
                  <textarea
                    className="input text-[13px] min-h-[56px] resize-y"
                    placeholder="Answer"
                    {...register(`businessFaqs.${i}.answer` as const)}
                  />
                </div>
                <button
                  type="button"
                  aria-label="Remove"
                  className="text-[var(--ink-mute)] hover:text-[var(--destructive)] p-1.5 rounded-lg transition-colors"
                  onClick={() => remove(i)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {(errors.businessFaqs?.[i]?.question || errors.businessFaqs?.[i]?.answer) && (
                <p className="text-[11px] text-[var(--destructive)]">
                  {errors.businessFaqs?.[i]?.question?.message ?? errors.businessFaqs?.[i]?.answer?.message}
                </p>
              )}
            </div>
          ))}
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
