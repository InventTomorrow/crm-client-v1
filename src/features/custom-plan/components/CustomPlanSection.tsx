"use client";

import { CheckCircle2, Loader2, MessageSquare, Users } from "lucide-react";
import Container from "@/features/landing/components/Container";
import Reveal from "@/features/landing/components/Reveal";
import SectionHeading from "@/features/landing/components/SectionHeading";
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
import { useCustomPlanRequest } from "../hooks/useCustomPlanRequest";
import { LeadCountControl } from "./LeadCountControl";
import { LEAD_PRICED_DURATIONS, type LeadPricing } from "../types";
import {
  DURATION_LABEL,
  formatRupees,
  getDurationDiscountPercent,
} from "../utils/leadPricing";

const FIELD_CLASS =
  "h-11 rounded-xl border-brand-mint-2 bg-white dark:bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20";
const LABEL_CLASS = "text-[13px] font-semibold text-brand-dark";

export default function CustomPlanSection({
  leadPricing,
}: {
  leadPricing: LeadPricing;
}) {
  const {
    form,
    quote,
    onSubmit,
    isSubmitting,
    submittedRequest,
    submittedEmail,
    startNewRequest,
  } = useCustomPlanRequest(leadPricing);
  const hasAnyDiscount =
    leadPricing.quarterlyDiscountPercent > 0 ||
    leadPricing.semiAnnualDiscountPercent > 0 ||
    leadPricing.annualDiscountPercent > 0;

  return (
    <section id="custom-plan" className="scroll-mt-28 bg-white py-16 sm:py-24">
      <Container>
        <SectionHeading
          title="Build Your Own Plan"
          subtitle="Pay for the leads you expect each month, counted across all your workspaces. Pick a number, see your price, and we will set the plan up for you."
        />

        <Reveal>
          <Form {...form}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="mx-auto mt-12 grid max-w-[1080px] gap-6 lg:grid-cols-5"
            >
              <div className="rounded-3xl bg-brand-mint-3 p-7 sm:p-8 lg:col-span-3">
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="monthlyLeads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={LABEL_CLASS}>Leads per month</FormLabel>
                        <FormControl>
                          <LeadCountControl
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            inputRef={field.ref}
                            minLeads={leadPricing.minLeads}
                            maxLeads={leadPricing.maxLeads}
                            isDisabled={Boolean(submittedRequest)}
                            inputClassName={FIELD_CLASS}
                          />
                        </FormControl>
                        <FormMessage className="text-[12px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem className="mt-6">
                      <FormLabel className={LABEL_CLASS}>Billing</FormLabel>
                      <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {LEAD_PRICED_DURATIONS.map((duration) => {
                          const isSelected = field.value === duration;
                          const periodDiscountPercent = getDurationDiscountPercent(
                            duration,
                            leadPricing,
                          );
                          return (
                            <button
                              key={duration}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              disabled={Boolean(submittedRequest)}
                              onClick={() => field.onChange(duration)}
                              className={`rounded-xl border px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                                isSelected
                                  ? "border-brand-green bg-brand-green text-white"
                                  : "border-brand-mint-2 bg-white text-brand-dark hover:border-brand-green"
                              }`}
                            >
                              <span className="block">{DURATION_LABEL[duration]}</span>
                              {hasAnyDiscount && (
                                <span
                                  className={`mt-0.5 block text-[11.5px] font-medium ${
                                    isSelected ? "text-white/85" : "text-brand-green"
                                  }`}
                                >
                                  {periodDiscountPercent > 0
                                    ? `Save ${periodDiscountPercent}%`
                                    : "Pay monthly"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="my-7 h-px w-full bg-brand-dark opacity-10" />

                {quote ? (
                  <div aria-live="polite">
                    <p className="text-[13px] font-medium text-brand-text">Your price</p>
                    <div className="mt-1 flex items-end gap-2">
                      <span className="text-[2.75rem] font-bold leading-none tracking-tight text-brand-dark">
                        {formatRupees(quote.totalPrice)}
                      </span>
                      <span className="mb-1 text-[15px] text-brand-text">
                        for {quote.months === 1 ? "1 month" : `${quote.months} months`}
                      </span>
                    </div>
                    {quote.discountPercent > 0 && (
                      <p className="mt-2 flex items-center gap-2 text-[14px]">
                        <s className="text-brand-text-soft">{formatRupees(quote.listPrice)}</s>
                        <span className="rounded-full bg-brand-amber px-2.5 py-0.5 text-[12px] font-semibold text-white">
                          {quote.discountPercent}% OFF
                        </span>
                      </p>
                    )}
                    {quote.months > 1 && (
                      <p className="mt-1.5 text-[13px] text-brand-text">
                        Works out to {formatRupees(quote.effectiveMonthlyPrice)} a month
                      </p>
                    )}
                    <ul className="mt-5 space-y-2.5 text-[14px] text-brand-text">
                      <li className="flex items-center gap-2.5">
                        <Users className="size-4 shrink-0 text-brand-green" />
                        {quote.monthlyLeads.toLocaleString("en-PK")} leads a month at{" "}
                        {formatRupees(leadPricing.pricePerLead)} each
                      </li>
                      <li className="flex items-center gap-2.5">
                        <MessageSquare className="size-4 shrink-0 text-brand-green" />
                        {quote.monthlyMessages.toLocaleString("en-PK")} AI messages a month included
                      </li>
                      {leadPricing.baseFee > 0 && (
                        <li className="flex items-center gap-2.5">
                          <CheckCircle2 className="size-4 shrink-0 text-brand-green" />
                          {formatRupees(leadPricing.baseFee)} monthly platform fee
                        </li>
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-[14px] text-brand-text">
                    Enter between {leadPricing.minLeads.toLocaleString("en-PK")} and{" "}
                    {leadPricing.maxLeads.toLocaleString("en-PK")} leads to see your price.
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-brand-mint-2 bg-white p-7 shadow-card sm:p-8 lg:col-span-2">
                {submittedRequest ? (
                  <div role="status" aria-live="polite" className="flex h-full flex-col">
                    <CheckCircle2 className="size-10 text-brand-green" />
                    <h3 className="mt-4 text-xl font-bold text-brand-dark">Request received</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-brand-text">
                      We will review your {submittedRequest.quote.monthlyLeads.toLocaleString("en-PK")} lead
                      plan and send a checkout link to {submittedEmail}.
                    </p>
                    <p className="mt-4 text-[14px] font-semibold text-brand-dark">
                      Quoted: {formatRupees(submittedRequest.quote.totalPrice)}
                    </p>
                    <button
                      type="button"
                      onClick={startNewRequest}
                      className="mt-auto inline-flex h-11 items-center justify-center rounded-xl border border-brand-mint-2 px-5 text-[14px] font-semibold text-brand-dark transition-colors hover:border-brand-green"
                    >
                      Build another plan
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-brand-dark">Request this plan</h3>
                    <FormField
                      control={form.control}
                      name="customerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Your name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="name" className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              autoComplete="email"
                              placeholder="you@company.com"
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>WhatsApp number</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              autoComplete="tel"
                              placeholder="+92 300 0000000"
                              className={FIELD_CLASS}
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Business name (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="organization" className={FIELD_CLASS} />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={LABEL_CLASS}>Anything we should know? (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={3}
                              className="rounded-xl border-brand-mint-2 bg-white dark:bg-white text-brand-dark placeholder:text-brand-text-soft focus-visible:border-brand-green focus-visible:ring-brand-green/20"
                            />
                          </FormControl>
                          <FormMessage className="text-[12px]" />
                        </FormItem>
                      )}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !quote}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-5 text-base font-semibold text-white shadow-cta transition-colors hover:bg-brand-green-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      {isSubmitting ? "Sending…" : "Request this plan"}
                    </button>
                    <p className="text-center text-[13px] text-brand-text-soft">
                      No payment now. We will review it and send you a secure checkout link.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </Reveal>
      </Container>
    </section>
  );
}
