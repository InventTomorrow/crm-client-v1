"use client";

import { CheckCircle2, Clock, HelpCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import Container from "@/features/landing/components/Container";
import { SUPPORT_EMAIL } from "@/shared/lib/site";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { useContactForm } from "../hooks/useContactForm";

const SUPPORT_CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    description: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
  },
  {
    icon: HelpCircle,
    title: "Common questions",
    description: "Answers to what most people ask",
    href: "/#faq",
  },
  {
    icon: Clock,
    title: "Reply time",
    description: "Within one business day, Mon–Sat",
    href: null,
  },
] as const;

const inputClass =
  "h-11 rounded-xl border-brand-mint-2 bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20";

/** Help-centre contact page. Logic lives in useContactForm. */
export default function ContactView() {
  const { form, onSubmit, isSubmitting, isSent, sendAnother } = useContactForm();

  return (
    <main className="pb-20 pt-12 sm:pb-24 sm:pt-16">
      <Container>
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand-green">
            Help centre
          </p>
          <h1 className="mt-4 text-balance text-[2.25rem] font-bold leading-[1.12] tracking-tight text-brand-dark sm:text-[2.75rem]">
            Contact us
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-text md:text-[17px]">
            Tell us what you need help with — setup, billing, or something that
            is not working. Every message reaches a real person on our team.
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-brand-mint-2 bg-white p-6 shadow-card sm:p-8">
            {isSent ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <CheckCircle2 className="size-10 text-brand-green" />
                <h2 className="text-xl font-bold text-brand-dark">
                  Thanks — your message is with us
                </h2>
                <p className="max-w-sm text-[15px] leading-relaxed text-brand-text">
                  We reply by email within one business day. Check your spam
                  folder if you do not see us.
                </p>
                <button
                  type="button"
                  onClick={sendAnother}
                  className="mt-2 text-[14px] font-semibold text-brand-green hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="contact-name" className="text-brand-dark">Your name</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="contact-name"
                              autoComplete="name"
                              placeholder="Ali Raza"
                              disabled={isSubmitting}
                              className={inputClass}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="contact-email" className="text-brand-dark">Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="contact-email"
                              type="email"
                              autoComplete="email"
                              placeholder="you@company.com"
                              disabled={isSubmitting}
                              className={inputClass}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="contact-phone" className="text-brand-dark">
                            WhatsApp number{" "}
                            <span className="font-normal text-brand-text-soft">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="contact-phone"
                              type="tel"
                              autoComplete="tel"
                              placeholder="03XX XXXXXXX"
                              disabled={isSubmitting}
                              className={inputClass}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="contact-subject" className="text-brand-dark">Subject</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              id="contact-subject"
                              placeholder="Billing question"
                              disabled={isSubmitting}
                              className={inputClass}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="contact-message" className="text-brand-dark">How can we help?</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            id="contact-message"
                            rows={6}
                            placeholder="Describe the issue or question in a few lines."
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
                    {isSubmitting ? "Sending…" : "Send message"}
                  </button>
                </form>
              </Form>
            )}
          </div>

          <aside className="flex flex-col gap-4">
            {SUPPORT_CHANNELS.map(({ icon: Icon, title, description, href }) => {
              const body = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-mint text-brand-green">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[14px] font-semibold text-brand-dark">
                      {title}
                    </span>
                    <span className="text-[13px] text-brand-text">{description}</span>
                  </span>
                </>
              );

              return href ? (
                <Link
                  key={title}
                  href={href}
                  className="flex items-start gap-3 rounded-2xl border border-brand-mint-2 bg-white p-4 transition-colors hover:border-brand-green"
                >
                  {body}
                </Link>
              ) : (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-2xl border border-brand-mint-2 bg-white p-4"
                >
                  {body}
                </div>
              );
            })}
          </aside>
        </div>
      </Container>
    </main>
  );
}
