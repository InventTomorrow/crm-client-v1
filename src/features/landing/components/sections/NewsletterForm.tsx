"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useNewsletterSubscribe } from "../../hooks/useNewsletterSubscribe";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";

/** Footer email capture. Logic lives in useNewsletterSubscribe. */
export default function NewsletterForm() {
  const { form, onSubmit, isSubmitting, isSubscribed, isNewSubscriber } =
    useNewsletterSubscribe();

  // The thank-you note takes the form's place for a few seconds, then the form
  // returns on its own.
  if (isSubscribed) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-4 flex w-full max-w-sm items-start gap-3 rounded-xl border border-brand-green/25 bg-brand-mint px-4 py-3.5"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-green" />
        <div>
          <p className="text-[14px] font-semibold text-brand-dark">
            {isNewSubscriber ? "Thank you for subscribing!" : "You're already subscribed"}
          </p>
          <p className="mt-0.5 text-[12px] text-brand-text">
            {isNewSubscriber
              ? "Product updates and WhatsApp sales tips are on their way to your inbox."
              : "This email is already on our list — nothing more to do."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="mt-4 w-full max-w-sm" noValidate>
        <div className="flex flex-col gap-2 sm:flex-row">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    aria-label="Email address"
                    disabled={isSubmitting}
                    className="h-11 rounded-xl border-brand-mint-2 bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20"
                  />
                </FormControl>
                <FormMessage className="text-[12px]" />
              </FormItem>
            )}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Subscribing…" : "Subscribe"}
          </button>
        </div>
        <p className="mt-2 text-[12px] text-brand-text-soft">
          Product updates and WhatsApp sales tips. Unsubscribe anytime.
        </p>
      </form>
    </Form>
  );
}
