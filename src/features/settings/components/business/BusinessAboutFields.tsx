"use client";
import { Button } from "@/shared/ui/Button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Textarea } from "@/shared/ui/Textarea";
import { Loader2, Zap } from "lucide-react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { BusinessProfileForm } from "../../types";

export function BusinessAboutFields({
  form,
  isGenerating,
  onGenerateIntro,
}: {
  form: UseFormReturn<BusinessProfileForm>;
  isGenerating: boolean;
  onGenerateIntro: () => void;
}) {
  const description = useWatch({
    control: form.control,
    name: "businessDescription",
  });

  return (
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
            Shown when a customer asks about your business. Generate, then edit
            freely.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="flex-shrink-0"
          onClick={onGenerateIntro}
          disabled={isGenerating || (description ?? "").trim().length < 10}
        >
          {isGenerating ? (
            <>
              <Loader2 size={13} className="animate-spin" /> Generating…
            </>
          ) : (
            <>
              <Zap size={13} /> Generate with AI
            </>
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
  );
}
