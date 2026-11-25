"use client";

import type { ReactNode } from "react";
import { useId } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "framer-motion";
import { Calculator, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
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
import { useCustomPlanPrefill } from "../hooks/useCustomPlanPrefill";
import { useCustomPlanRequest } from "../hooks/useCustomPlanRequest";
import { useLeadPricing } from "../hooks/useLeadPricing";
import { LeadCountControl } from "./LeadCountControl";
import { LEAD_PRICED_DURATIONS, type LeadPricing } from "../types";
import {
  DURATION_LABEL,
  formatRupees,
  getDurationDiscountPercent,
  getLeadPlanQuote,
} from "../utils/leadPricing";

function BuilderSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 py-6 first:pt-0 last:pb-0">
      <div>
        <h3 className="text-[14px] font-semibold text-[var(--ink)]">{title}</h3>
        {description && (
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

/** Rolls the old value out and the new one in, so a changing price is easy to follow. */
function AnimatedValue({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("relative inline-flex overflow-hidden", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-[13px]">
      <span className="text-[var(--ink-soft)]">{label}</span>
      <AnimatedValue value={value} className="font-medium text-[var(--ink)]" />
    </div>
  );
}

function CustomPlanBuilder({
  leadPricing,
  onClose,
}: {
  leadPricing: LeadPricing;
  onClose: () => void;
}) {
  const billingLayoutGroupId = useId();
  const prefill = useCustomPlanPrefill();
  const { form, quote, onSubmit, isSubmitting, submittedRequest, submittedEmail } =
    useCustomPlanRequest(leadPricing, prefill);
  const selectedDuration = form.watch("duration");

  if (submittedRequest) {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center px-6 py-12 text-center"
      >
        <CheckCircle2 className="size-11 text-[var(--accent)]" />
        <h3 className="mt-4 text-[17px] font-semibold text-[var(--ink)]">Request received</h3>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
          We will review your {submittedRequest.quote.monthlyLeads.toLocaleString("en-PK")} lead
          plan and send a checkout link to {submittedEmail}.
        </p>
        <p className="mt-4 text-[14px] font-semibold text-[var(--ink)]">
          Quoted: {formatRupees(submittedRequest.quote.totalPrice)}
        </p>
        <Button className="mt-8" onClick={onClose}>
          Done
        </Button>
      </motion.div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
        noValidate
        className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <div className="divide-y divide-[var(--line)]">
          <BuilderSection
            title="Plan size"
            description="New leads you expect each month, counted across all your workspaces."
          >
            <FormField
              control={form.control}
              name="monthlyLeads"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leads per month</FormLabel>
                  <FormControl>
                    <LeadCountControl
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      minLeads={leadPricing.minLeads}
                      maxLeads={leadPricing.maxLeads}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BuilderSection>

          <BuilderSection
            title="Billing"
            description="Longer periods are billed upfront. Each option shows its total."
          >
            <LayoutGroup id={billingLayoutGroupId}>
              <div role="radiogroup" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {LEAD_PRICED_DURATIONS.map((duration) => {
                  const isSelected = duration === selectedDuration;
                  const periodTotal = quote
                    ? getLeadPlanQuote(quote.monthlyLeads, duration, leadPricing).totalPrice
                    : 0;
                  const periodDiscountPercent = getDurationDiscountPercent(duration, leadPricing);
                  return (
                    <motion.button
                      key={duration}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => form.setValue("duration", duration, { shouldValidate: true })}
                      className={cn(
                        "relative rounded-lg border px-3.5 py-3 text-left transition-colors",
                        isSelected
                          ? "border-transparent"
                          : "border-[var(--line)] hover:border-[var(--ink-mute)]",
                      )}
                    >
                      {isSelected && (
                        <motion.span
                          layoutId="selected-billing-period"
                          className="absolute inset-0 rounded-lg border border-[var(--accent)] bg-[var(--accent-soft)]"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <span className="relative flex items-center justify-between gap-2 text-[12px] text-[var(--ink-soft)]">
                        {DURATION_LABEL[duration]}
                        {periodDiscountPercent > 0 && (
                          <span className="rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                            Save {periodDiscountPercent}%
                          </span>
                        )}
                      </span>
                      <AnimatedValue
                        value={formatRupees(periodTotal)}
                        className="relative mt-1 text-[13.5px] font-semibold text-[var(--ink)]"
                      />
                    </motion.button>
                  );
                })}
              </div>
            </LayoutGroup>
          </BuilderSection>

          <BuilderSection
            title="Your details"
            description="Filled in from your account. Change anything that is out of date."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="name" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" autoComplete="email" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        autoComplete="tel"
                        placeholder="+92 300 0000000"
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="organization" className="h-10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="customerNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anything we should know? (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BuilderSection>
        </div>

        <aside className="self-start rounded-xl border border-[var(--line)] bg-[var(--bg)] p-5 lg:sticky lg:top-0">
          <p className="text-[11.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
            Your price
          </p>
          <AnimatedValue
            value={formatRupees(quote?.totalPrice ?? 0)}
            className={cn(
              "mt-2 text-[28px] font-semibold tracking-tight",
              quote ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
            )}
          />
          <p className="mt-1 text-[12.5px] text-[var(--ink-soft)]">
            {DURATION_LABEL[selectedDuration]}, {quote?.months ?? 1}{" "}
            {(quote?.months ?? 1) === 1 ? "month" : "months"}
            {quote && quote.months > 1 &&
              `, works out to ${formatRupees(quote.effectiveMonthlyPrice)} a month`}
          </p>

          <div className="mt-5 divide-y divide-[var(--line)] border-t border-[var(--line)]">
            <SummaryRow
              label="Leads / month"
              value={(quote?.monthlyLeads ?? 0).toLocaleString("en-PK")}
            />
            <SummaryRow
              label="Messages / month"
              value={(quote?.monthlyMessages ?? 0).toLocaleString("en-PK")}
            />
            <SummaryRow label="Price per lead" value={formatRupees(leadPricing.pricePerLead)} />
            {leadPricing.baseFee > 0 && (
              <SummaryRow label="Platform fee / month" value={formatRupees(leadPricing.baseFee)} />
            )}
            <SummaryRow label="Price / month" value={formatRupees(quote?.monthlyPrice ?? 0)} />
            <SummaryRow
              label={`Full price (${quote?.months ?? 1} mo)`}
              value={formatRupees(quote?.listPrice ?? 0)}
            />
            <SummaryRow
              label={`Discount (${quote?.discountPercent ?? 0}%)`}
              value={
                quote && quote.discountAmount > 0
                  ? `${formatRupees(quote.discountAmount)} off`
                  : "None"
              }
            />
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={isSubmitting || !quote}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Sending…" : "Request this plan"}
          </Button>
          <p
            className={cn(
              "mt-3 text-center text-[12px]",
              quote ? "text-[var(--ink-mute)]" : "font-medium text-destructive",
            )}
          >
            {quote
              ? "No payment now. We send a checkout link once it is set up."
              : `Enter ${leadPricing.minLeads.toLocaleString("en-PK")} to ${leadPricing.maxLeads.toLocaleString("en-PK")} leads to see your price.`}
          </p>
        </aside>
      </form>
    </Form>
  );
}

export function CustomPlanDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: leadPricing, isError, refetch } = useLeadPricing({ enabled: open });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-5xl">
        <DialogHeader className="border-b border-[var(--line)] px-6 py-5">
          <DialogTitle className="flex items-center gap-2.5 text-[16px]">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Calculator className="size-4" />
            </span>
            Build a custom plan
          </DialogTitle>
          <DialogDescription>
            Pay for the leads you expect each month. Your price updates as you go.
          </DialogDescription>
        </DialogHeader>

        <MotionConfig reducedMotion="user">
          {leadPricing ? (
            <CustomPlanBuilder leadPricing={leadPricing} onClose={() => onOpenChange(false)} />
          ) : (
            <div className="flex items-center justify-center gap-2 px-6 py-16 text-[13px] text-[var(--ink-soft)]">
              {isError ? (
                <>
                  Could not load pricing.
                  <Button variant="link" size="sm" onClick={() => refetch()}>
                    Try again
                  </Button>
                </>
              ) : (
                <>
                  <Loader2 className="size-4 animate-spin" /> Loading pricing…
                </>
              )}
            </div>
          )}
        </MotionConfig>
      </DialogContent>
    </Dialog>
  );
}
