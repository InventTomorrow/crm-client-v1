"use client";

import Container from "@/features/landing/components/Container";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { BadgePercent, CheckCircle2, Handshake, LineChart, Loader2, Wallet } from "lucide-react";
import type { ComponentProps } from "react";
import { useAffiliateApplicationForm } from "../../hooks/useAffiliateApplicationForm";
import type { AffiliateApplicationInput } from "../../types";

const PROGRAMME_POINTS = [
  { icon: BadgePercent, title: "Give a discount", description: "Your code takes money off a customer's first plan." },
  { icon: Wallet, title: "Earn commission", description: "Get paid a share of every referred account's first payment." },
  { icon: LineChart, title: "See your numbers", description: "Track sign-ups, payments and earnings in your own dashboard." },
  { icon: Handshake, title: "No workspace needed", description: "Your affiliate account works on its own. Add a workspace any time." },
] as const;

const inputClass =
  "h-11 rounded-xl border-brand-mint-2 bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20";

type TextFieldName = Exclude<keyof AffiliateApplicationInput, "message">;

const TEXT_FIELDS: { name: TextFieldName; label: string; optional?: boolean; input: ComponentProps<"input"> }[] = [
  { name: "name", label: "Your name", input: { autoComplete: "name", placeholder: "Ali Raza" } },
  { name: "email", label: "Email", input: { type: "email", autoComplete: "email", placeholder: "you@example.com" } },
  { name: "phone", label: "WhatsApp number", optional: true, input: { type: "tel", autoComplete: "tel", placeholder: "03XX XXXXXXX" } },
  { name: "website", label: "Website or social profile", optional: true, input: { type: "url", placeholder: "https://instagram.com/yourpage" } },
];

/** Public "become an affiliate" page. Logic lives in useAffiliateApplicationForm. */
export default function AffiliateApplicationView() {
  const { form, onSubmit, isSubmitting, isSubmitted } = useAffiliateApplicationForm();

  return (
    <main className="pb-20 pt-12 sm:pb-24 sm:pt-16">
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-green">Affiliate programme</p>
          <h1 className="mt-4 text-balance text-[2.25rem] font-bold leading-[1.12] tracking-tight text-brand-dark sm:text-[2.75rem]">
            Earn by recommending AsaanRabta
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-text md:text-[17px]">
            Tell us a little about how you would share AsaanRabta. We review every application and email you a link to
            set up your account once you are in.
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-brand-mint-2 bg-white p-6 shadow-card sm:p-8">
            {isSubmitted ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="size-10 text-brand-green" />
                <h2 className="text-xl font-bold text-brand-dark">Thanks, your application is in</h2>
                <p className="max-w-sm text-[15px] leading-relaxed text-brand-text">
                  We will review it and get back to you by email. Check your spam folder if you do not hear from us.
                </p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {TEXT_FIELDS.map((textField) => (
                      <FormField
                        key={textField.name}
                        control={form.control}
                        name={textField.name}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel htmlFor={`affiliate-${textField.name}`} className="text-brand-dark">
                              {textField.label}
                              {textField.optional && (
                                <span className="font-normal text-brand-text-soft"> (optional)</span>
                              )}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                {...textField.input}
                                id={`affiliate-${textField.name}`}
                                disabled={isSubmitting}
                                className={inputClass}
                              />
                            </FormControl>
                            <FormMessage className="text-[12px]" />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="affiliate-message" className="text-brand-dark">
                          How would you promote AsaanRabta?
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            id="affiliate-message"
                            rows={5}
                            placeholder="Your audience, where you post, and the kind of businesses you know."
                            disabled={isSubmitting}
                            className="rounded-xl border-brand-mint-2 bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20"
                          />
                        </FormControl>
                        <FormMessage className="text-[12px]" />
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-brand-green px-6 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {isSubmitting ? "Sending…" : "Send application"}
                  </button>
                </form>
              </Form>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            {PROGRAMME_POINTS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3 rounded-2xl border border-brand-mint-2 bg-white p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
                  <Icon className="size-[18px]" />
                </span>
                <span className="flex flex-col">
                  <span className="text-[14px] font-semibold text-brand-dark">{title}</span>
                  <span className="text-[13px] text-brand-text">{description}</span>
                </span>
              </div>
            ))}
          </aside>
        </div>
      </Container>
    </main>
  );
}
