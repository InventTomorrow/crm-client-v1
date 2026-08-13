"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { Plan } from "@/features/billing/types";
import { formatPlanPrice } from "@/features/billing/utils/planFormat";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/Accordion";
import { Button } from "@/shared/ui/Button";
import { FieldGroup, FieldSeparator } from "@/shared/ui/Field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/Input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/NativeSelect";
import { Textarea } from "@/shared/ui/Textarea";
import { useSubmitSubscription } from "./hooks";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "./types";
import type { SubscriptionCheckoutPrefill } from "./types";
import {
  subscriptionCheckoutSchema,
  type SubscriptionCheckoutFormInput,
} from "./validation";

type SectionId = "details" | "payment" | "note";
type FormFieldName = keyof SubscriptionCheckoutFormInput;

/** Fields owned by each accordion section — drives per-section status + error reveal. */
const SECTION_FIELDS: Record<SectionId, FormFieldName[]> = {
  details: ["customerName", "customerEmail", "customerPhone", "businessName"],
  payment: ["paymentMethod", "paymentAmount", "paymentReference", "receiptUrl"],
  note: ["customerNote"],
};

const SECTION_REQUIRED_FIELDS: Record<SectionId, FormFieldName[]> = {
  details: ["customerName", "customerEmail", "customerPhone"],
  payment: ["paymentMethod", "paymentAmount", "receiptUrl"],
  note: [],
};

export function SubscriptionCheckoutForm({
  token,
  plan,
  prefill,
  onSubmitted,
}: {
  token: string;
  plan: Plan;
  prefill: SubscriptionCheckoutPrefill;
  onSubmitted: () => void;
}) {
  const submit = useSubmitSubscription(token);
  const requiresPayment = plan.price > 0;
  const emailLocked = Boolean(prefill.customerEmail);

  // Optional note starts collapsed; the two required sections stay open so no
  // required field is ever hidden behind a closed panel.
  const [openSections, setOpenSections] = useState<string[]>([
    "details",
    "payment",
  ]);

  const form = useForm<SubscriptionCheckoutFormInput>({
    resolver: zodResolver(subscriptionCheckoutSchema(requiresPayment)),
    values: {
      customerName: prefill.customerName ?? "",
      customerEmail: prefill.customerEmail ?? "",
      customerPhone: prefill.customerPhone ?? "",
      businessName: "",
      paymentMethod: "BANK_TRANSFER",
      paymentReference: "",
      paymentAmount: plan.price,
      receiptUrl: "",
      customerNote: "",
    },
  });

  const values = useWatch({ control: form.control });
  const { errors } = form.formState;

  const getSectionStatus = (section: SectionId) => {
    if (SECTION_FIELDS[section].some((name) => errors[name])) return "error";
    const required =
      section === "payment" && !requiresPayment
        ? []
        : SECTION_REQUIRED_FIELDS[section];
    if (required.length === 0) return "optional";
    const allFilled = required.every((name) => {
      const value = values[name];
      return value !== undefined && value !== null && String(value).length > 0;
    });
    return allFilled ? "complete" : "pending";
  };

  // Reveal whichever collapsed section is blocking submission.
  const revealInvalidSections = () => {
    const invalid = (Object.keys(SECTION_FIELDS) as SectionId[]).filter(
      (section) => SECTION_FIELDS[section].some((name) => errors[name]),
    );
    if (invalid.length > 0) {
      setOpenSections((open) => [...new Set([...open, ...invalid])]);
    }
  };

  const handleValidSubmit = (formValues: SubscriptionCheckoutFormInput) =>
    submit.mutate(
      {
        customerName: formValues.customerName,
        customerEmail: formValues.customerEmail,
        customerPhone: formValues.customerPhone,
        businessName: formValues.businessName || undefined,
        paymentMethod: formValues.paymentMethod,
        paymentReference: formValues.paymentReference || undefined,
        paymentAmount: Number(formValues.paymentAmount),
        currency: plan.currency,
        receiptUrl: formValues.receiptUrl || undefined,
        customerNote: formValues.customerNote || undefined,
      },
      { onSuccess: onSubmitted },
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleValidSubmit, revealInvalidSections)}
        className="flex flex-col gap-4"
      >
        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={setOpenSections}
          className="gap-3"
        >
          <CheckoutSection
            id="details"
            step={1}
            title="Your details"
            hint="Who the workspace belongs to"
            status={getSectionStatus("details")}
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@email.com"
                          {...field}
                          readOnly={emailLocked}
                          aria-readonly={emailLocked}
                          className={
                            emailLocked ? "cursor-not-allowed opacity-70" : undefined
                          }
                        />
                      </FormControl>
                      {emailLocked ? (
                        <p className="text-[11.5px] text-[var(--ink-mute)]">
                          Linked to your account — contact us to change it.
                        </p>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="03xx-xxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business name{" "}
                      <span className="text-[var(--ink-mute)]">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </CheckoutSection>

          <CheckoutSection
            id="payment"
            step={2}
            title={requiresPayment ? "Payment details" : "Payment"}
            hint={
              requiresPayment
                ? `How you sent ${formatPlanPrice(plan)}`
                : "Nothing to pay on this plan"
            }
            status={getSectionStatus("payment")}
          >
            {requiresPayment ? (
              <FieldGroup>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you pay? *</FormLabel>
                        <FormControl>
                          <NativeSelect size="lg" {...field}>
                            {PAYMENT_METHODS.map((method) => (
                              <NativeSelectOption key={method} value={method}>
                                {PAYMENT_METHOD_LABELS[method]}
                              </NativeSelectOption>
                            ))}
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount paid *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            disabled={field.disabled}
                            value={String(field.value ?? "")}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="paymentReference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Transaction reference{" "}
                        <span className="text-[var(--ink-mute)]">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. HBL-77120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FieldSeparator />

                <FormField
                  control={form.control}
                  name="receiptUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment receipt *</FormLabel>
                      <FormControl>
                        <ReceiptUploadField
                          token={token}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={submit.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FieldGroup>
            ) : (
              <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-2)] p-3.5 text-[12.5px] text-[var(--ink-soft)]">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <span>
                  This plan is free — no payment needed. Submit and we&apos;ll
                  activate your workspace.
                </span>
              </div>
            )}
          </CheckoutSection>

          <CheckoutSection
            id="note"
            step={3}
            title="Additional note"
            hint="Anything we should know"
            status={getSectionStatus("note")}
          >
            <FieldGroup>
              <FormField
                control={form.control}
                name="customerNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Note <span className="text-[var(--ink-mute)]">(optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Anything we should know?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FieldGroup>
          </CheckoutSection>
        </Accordion>

        <Button
          type="submit"
          className="w-full justify-center"
          disabled={submit.isPending}
        >
          {submit.isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <CheckCircle2 size={14} />
          )}
          Submit for approval · {formatPlanPrice(plan)}
        </Button>

        <p className="text-center text-[11px] text-[var(--ink-mute)]">
          We&apos;ll verify your payment and activate your workspace within 24 hours.
        </p>
      </form>
    </Form>
  );
}

/* ─── Section shell ─────────────────────────────────────────────────────────── */

type SectionStatus = "complete" | "error" | "pending" | "optional";

const STATUS_LABEL: Record<SectionStatus, string> = {
  complete: "Complete",
  error: "Needs attention",
  pending: "Required",
  optional: "Optional",
};

function CheckoutSection({
  id,
  step,
  title,
  hint,
  status,
  children,
}: {
  id: SectionId;
  step: number;
  title: string;
  hint: string;
  status: SectionStatus;
  children: React.ReactNode;
}) {
  const isError = status === "error";

  return (
    <AccordionItem
      value={id}
      className={cn(
        "overflow-hidden rounded-2xl border bg-[var(--surface)]",
        isError ? "border-destructive/50" : "border-[var(--line)]",
      )}
    >
      <AccordionTrigger className="items-center gap-3 px-4 py-3.5 hover:no-underline md:px-5">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            isError
              ? "bg-destructive text-white"
              : status === "complete"
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
          )}
        >
          {status === "complete" ? <CheckCircle2 size={13} /> : step}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold text-[var(--ink)]">
            {title}
          </span>
          <span className="block text-[11.5px] font-normal text-[var(--ink-mute)]">
            {hint}
          </span>
        </span>

        <span
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold sm:inline-flex",
            isError
              ? "bg-destructive-soft text-destructive"
              : status === "complete"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
          )}
        >
          {isError && <AlertCircle size={11} />}
          {STATUS_LABEL[status]}
        </span>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-5 md:px-5">{children}</AccordionContent>
    </AccordionItem>
  );
}
