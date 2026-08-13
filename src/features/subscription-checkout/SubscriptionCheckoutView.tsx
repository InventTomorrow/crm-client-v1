"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
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
import { formatPlanPrice, formatPlanPeriod } from "@/features/billing/utils/planFormat";
import { usePublicSubscriptionLink, useSubmitSubscription } from "./hooks";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from "./types";
import {
  subscriptionCheckoutSchema,
  type SubscriptionCheckoutFormInput,
} from "./validation";

/* ─── Plan sidebar ─────────────────────────────────────────────────────────── */

function PlanSidebar({ plan, supportContact }: {
  plan: import("@/features/billing/types").Plan;
  supportContact: import("./types").SupportContact;
}) {
  const hasChannel = Boolean(
    supportContact.supportPhone ||
    supportContact.supportWhatsapp ||
    supportContact.supportEmail,
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Plan card */}
      <div className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)]">
        {/* Gradient header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_oklch,var(--accent)_70%,#7c3aed)] px-5 py-6">
          {/* Decorative rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border border-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 rounded-full border border-white/10"
          />

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">
                Your plan
              </p>
              <h2 className="mt-1 text-[22px] font-bold leading-tight text-white">
                {plan.name}
              </h2>
              {plan.isTrial && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <Zap size={10} />
                  Trial
                </span>
              )}
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles size={18} className="text-white" />
            </div>
          </div>

          <div className="mt-4 flex items-end gap-1">
            <span className="text-[28px] font-bold leading-none text-white">
              {formatPlanPrice(plan)}
            </span>
            <span className="mb-0.5 text-[13px] text-white/60">
              / {formatPlanPeriod(plan.duration, plan.customDurationDays)}
            </span>
          </div>
        </div>

        {/* Feature rows */}
        <div className="divide-y divide-[var(--line)]">
          <FeatureRow icon={<BadgeCheck size={14} />} label="Workspaces" value={plan.maxWorkspaces.toLocaleString("en-PK")} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Team members / workspace" value={plan.maxMembersPerWorkspace.toLocaleString("en-PK")} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Connected channels" value={plan.maxChannels.toLocaleString("en-PK")} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Messages / month" value={plan.maxMonthlyMessages.toLocaleString("en-PK")} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Image vision" value={plan.maxImageMessages.toLocaleString("en-PK")} muted />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Voice messages" value={plan.maxVoiceMessages.toLocaleString("en-PK")} muted />
        </div>
      </div>

      {/* Support block */}
      {(hasChannel || supportContact.paymentInstructions) && (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
            Need help?
          </p>

          {supportContact.paymentInstructions && (
            <div className="mb-3 rounded-lg bg-[var(--surface-2)] p-3 text-[12.5px] whitespace-pre-line text-[var(--ink-soft)]">
              {supportContact.paymentInstructions}
            </div>
          )}

          {hasChannel && (
            <div className="flex flex-col gap-2 text-[13px]">
              {supportContact.supportName && (
                <div className="font-medium text-[var(--ink)]">
                  {supportContact.supportName}
                </div>
              )}
              {supportContact.supportPhone && (
                <ContactLink href={`tel:${supportContact.supportPhone}`} label={supportContact.supportPhone} icon="phone" />
              )}
              {supportContact.supportWhatsapp && (
                <ContactLink
                  href={`https://wa.me/${supportContact.supportWhatsapp.replace(/\D/g, "")}`}
                  label={`WhatsApp ${supportContact.supportWhatsapp}`}
                  icon="whatsapp"
                  external
                />
              )}
              {supportContact.supportEmail && (
                <ContactLink href={`mailto:${supportContact.supportEmail}`} label={supportContact.supportEmail} icon="email" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Trust badges */}
      <div className="flex flex-wrap gap-2">
        {["Secure checkout", "Verified receipt", "Manual activation"].map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-[11px] text-[var(--ink-mute)]"
          >
            <CheckCircle2 size={10} className="text-[var(--accent)]" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeatureRow({
  icon,
  label,
  value,
  muted,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-5 py-2.5 ${muted ? "opacity-70" : ""}`}>
      <span className="flex items-center gap-2 text-[12.5px] text-[var(--ink-mute)]">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </span>
      <span className="text-[12.5px] font-semibold text-[var(--ink)]">{value}</span>
    </div>
  );
}

function ContactLink({
  href,
  label,
  icon,
  external,
}: {
  href: string;
  label: string;
  icon: "phone" | "whatsapp" | "email";
  external?: boolean;
}) {
  const iconEl =
    icon === "whatsapp" ? (
      <MessageCircle size={13} className="shrink-0 text-[#25D366]" />
    ) : icon === "phone" ? (
      <Building2 size={13} className="shrink-0 text-[var(--ink-mute)]" />
    ) : (
      <BadgeCheck size={13} className="shrink-0 text-[var(--ink-mute)]" />
    );

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2 text-[var(--ink-soft)] no-underline transition-colors hover:text-[var(--ink)]"
    >
      {iconEl}
      <span>{label}</span>
    </a>
  );
}

/* ─── Section label helper ──────────────────────────────────────────────────── */

function SectionLabel({ step, label }: { step: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-white">
        {step}
      </span>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
        {label}
      </p>
    </div>
  );
}

/* ─── Main view ─────────────────────────────────────────────────────────────── */

export function SubscriptionCheckoutView({ token }: { token: string }) {
  const { data, isLoading, isError, error } = usePublicSubscriptionLink(token);
  const submit = useSubmitSubscription(token);

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

  /* ── Loading ── */
  if (isLoading) {
    return (
      <Centered>
        <Loader2 size={26} className="animate-spin text-[var(--accent)]" />
      </Centered>
    );
  }

  /* ── Error / not found ── */
  if (isError || !data) {
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
          <Button asChild className="mt-4">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </Centered>
    );
  }

  const { plan, supportContact } = data;
  const submitted = submit.isSuccess;
  const emailLocked = Boolean(data.prefill.customerEmail);

  return (
    <div className="mx-auto w-full max-w-[1020px] px-4 py-8 md:py-12">
      {/* Brand header */}
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-md shadow-[color-mix(in_oklch,var(--accent)_40%,transparent)]">
          <Sparkles size={16} />
        </span>
        <div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">AsaanRabta</div>
          <div className="text-[11.5px] text-[var(--ink-mute)]">Complete your subscription</div>
        </div>
      </div>

      {/* Two-column grid: collapses to single column on mobile */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1fr_1.1fr] lg:gap-8">

        {/* LEFT — plan details (sticky on desktop) */}
        <div className="md:sticky md:top-8">
          <PlanSidebar plan={plan} supportContact={supportContact} />
        </div>

        {/* RIGHT — form (or success state) */}
        <div>
          {submitted ? (
            <SubmissionSuccess planName={plan.name} contact={supportContact} />
          ) : (
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
                className="flex flex-col gap-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6"
              >
                {/* ── Section 1: Your details ── */}
                <SectionLabel step={1} label="Your details" />

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
                            className={emailLocked ? "cursor-not-allowed opacity-70" : undefined}
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
                      <FormLabel>Business name <span className="text-[var(--ink-mute)]">(optional)</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Your business" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Divider ── */}
                <div className="-mx-1 border-t border-dashed border-[var(--line)]" />

                {/* ── Section 2: Payment ── */}
                {requiresPayment ? (
                  <>
                    <SectionLabel step={2} label="Payment details" />

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
                          <FormLabel>Transaction reference <span className="text-[var(--ink-mute)]">(optional)</span></FormLabel>
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
                  <>
                    <SectionLabel step={2} label="Payment" />
                    <div className="flex items-start gap-3 rounded-xl bg-[var(--surface-2)] p-3.5 text-[12.5px] text-[var(--ink-soft)]">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                      <span>
                        This plan is free — no payment needed. Submit and we&apos;ll
                        activate your workspace.
                      </span>
                    </div>
                  </>
                )}

                {/* ── Divider ── */}
                <div className="-mx-1 border-t border-dashed border-[var(--line)]" />

                {/* ── Section 3: Note ── */}
                <SectionLabel step={3} label="Additional note" />

                <FormField
                  control={form.control}
                  name="customerNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Note <span className="text-[var(--ink-mute)]">(optional)</span></FormLabel>
                      <FormControl>
                        <Textarea rows={3} placeholder="Anything we should know?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Submit ── */}
                <Button
                  type="submit"
                  className="mt-1 w-full justify-center"
                  disabled={submit.isPending}
                >
                  {submit.isPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  Submit for approval · {formatPlanPrice(plan)}
                </Button>

                <p className="text-center text-[11px] text-[var(--ink-mute)]">
                  We&apos;ll verify your payment and activate your workspace within 24 hours.
                </p>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      {children}
    </div>
  );
}
