"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkle } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { NativeSelect, NativeSelectOption } from "@/shared/ui/NativeSelect";
import { Textarea } from "@/shared/ui/Textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { formatPlanPrice } from "@/features/billing/utils/planFormat";
import { usePublicSubscriptionLink, useSubmitSubscription } from "./hooks";
import { PlanSummaryCard } from "./PlanSummaryCard";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { SupportContactBlock } from "./SupportContactBlock";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "./types";
import {
  subscriptionCheckoutSchema,
  type SubscriptionCheckoutFormInput,
} from "./validation";

export function SubscriptionCheckoutView({ token }: { token: string }) {
  const { data, isLoading, isError, error } = usePublicSubscriptionLink(token);
  const submit = useSubmitSubscription(token);

  // The plan arrives async, so the resolver has to react to it — a free plan
  // must not require a receipt.
  const requiresPayment = (data?.plan.price ?? 0) > 0;

  const form = useForm<SubscriptionCheckoutFormInput>({
    resolver: zodResolver(subscriptionCheckoutSchema(requiresPayment)),
    values: {
      customerName: data?.prefill.customerName ?? "",
      customerEmail: data?.prefill.customerEmail ?? "",
      customerPhone: data?.prefill.customerPhone ?? "",
      businessName: "",
      paymentMethod: "BANK_TRANSFER",
      paymentReference: "",
      paymentAmount: data?.plan.price ?? 0,
      receiptUrl: "",
      customerNote: "",
    },
  });

  if (isLoading) {
    return (
      <Centered>
        <Loader2 size={26} className="animate-spin text-[var(--accent)]" />
      </Centered>
    );
  }

  if (isError || !data) {
    // The API distinguishes used (409) from expired/revoked (410); both mean
    // "this link can't be used" to the customer.
    const status = (error as { response?: { status?: number } } | null)?.response?.status;
    const headline =
      status === 409
        ? "This link has already been used"
        : status === 410
          ? "This link has expired"
          : "Checkout link not found";

    return (
      <Centered>
        <div className="text-center">
          <p className="text-[16px] font-semibold text-[var(--ink)]">{headline}</p>
          <p className="mt-1 text-[13px] text-[var(--ink-mute)]">
            Please ask for a new link, or get in touch with us directly.
          </p>
        </div>
      </Centered>
    );
  }

  const { plan, supportContact } = data;
  const submitted = submit.isSuccess;
  // The link carries the account's email; keep it fixed so the request can't
  // be filed under a different address than the workspace being activated.
  // readOnly (not disabled) — RHF omits disabled fields from submitted values.
  const emailLocked = Boolean(data.prefill.customerEmail);

  return (
    <div className="mx-auto min-h-screen w-full max-w-[480px] px-4 py-8">
      {/* Brand */}
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white">
          <Sparkle size={17} />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">AsaanRabta</div>
          <div className="text-[11.5px] text-[var(--ink-mute)]">Complete your subscription</div>
        </div>
      </div>

      <PlanSummaryCard plan={plan} />

      {submitted ? (
        <SubmissionSuccess planName={plan.name} contact={supportContact} />
      ) : (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) =>
                submit.mutate({
                  customerName: values.customerName,
                  customerEmail: values.customerEmail,
                  customerPhone: values.customerPhone,
                  businessName: values.businessName || undefined,
                  paymentMethod: values.paymentMethod,
                  paymentReference: values.paymentReference || undefined,
                  paymentAmount: Number(values.paymentAmount),
                  currency: plan.currency,
                  receiptUrl: values.receiptUrl || undefined,
                  customerNote: values.customerNote || undefined,
                }),
              )}
              className="card mt-4 flex flex-col gap-3 p-4"
            >
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
                Your details
              </p>

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

              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        {/* Locked when the link already carries the account's
                            email — this is who the subscription gets tied to,
                            so it must match the workspace we're activating. */}
                        <Input
                          placeholder="you@email.com"
                          {...field}
                          readOnly={emailLocked}
                          aria-readonly={emailLocked}
                          className={emailLocked ? 'cursor-not-allowed opacity-70' : undefined}
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
                    <FormLabel>Business name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your business" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {requiresPayment ? (
                <>
              <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
                Payment
              </p>

              <div className="grid grid-cols-2 gap-2.5">
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
                        {/* z.coerce.number() types the form input as `unknown`,
                            so bind the raw string and let Zod coerce on submit. */}
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
                    <FormLabel>Transaction reference</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. HBL-77120" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                </>
              ) : (
                <p className="mt-2 rounded-lg bg-[var(--surface-2)] p-3 text-[12.5px] text-[var(--ink-soft)]">
                  This plan is free — no payment needed. Submit and we&apos;ll
                  activate your workspace.
                </p>
              )}

              <FormField
                control={form.control}
                name="customerNote"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Anything we should know?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mt-1 w-full justify-center"
                disabled={submit.isPending}
              >
                {submit.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                Submit for approval · {formatPlanPrice(plan)}
              </Button>

              <p className="text-center text-[11px] text-[var(--ink-mute)]">
                We&apos;ll verify your payment and activate your workspace.
              </p>
            </form>
          </Form>

          <SupportContactBlock contact={supportContact} />
        </>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">{children}</div>
  );
}
