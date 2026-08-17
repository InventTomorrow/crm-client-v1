"use client";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Crown,
  Loader2,
  MessageCircle,
  MessageSquare,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { formatPlanPrice, formatPlanPeriod } from "@/features/billing/utils/planFormat";
import { formatPlanLimit } from "@/features/billing/utils/planLimits";
import { usePublicSubscriptionLink } from "./hooks";
import { SubmissionSuccess } from "./SubmissionSuccess";
import { SubscriptionCheckoutForm } from "./SubscriptionCheckoutForm";

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
              <Crown size={18} className="text-white" />
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
          <FeatureRow icon={<BadgeCheck size={14} />} label="Workspaces" value={formatPlanLimit(plan.maxWorkspaces)} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Team members / workspace" value={formatPlanLimit(plan.maxMembersPerWorkspace)} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Connected channels" value={formatPlanLimit(plan.maxChannels)} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Messages / month" value={formatPlanLimit(plan.maxMonthlyMessages)} />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Image vision" value={formatPlanLimit(plan.maxImageMessages)} muted />
          <FeatureRow icon={<BadgeCheck size={14} />} label="Voice messages" value={formatPlanLimit(plan.maxVoiceMessages)} muted />
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

/* ─── Main view ─────────────────────────────────────────────────────────────── */

export function SubscriptionCheckoutView({ token }: { token: string }) {
  const { data, isLoading, isError, error } = usePublicSubscriptionLink(token);
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  return (
    <div className="mx-auto w-full max-w-[1020px] px-4 py-8 md:py-12">
      {/* Brand header */}
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-md shadow-[color-mix(in_oklch,var(--accent)_40%,transparent)]">
          <MessageSquare size={16} />
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
          {isSubmitted ? (
            <SubmissionSuccess planName={plan.name} contact={supportContact} />
          ) : (
            <SubscriptionCheckoutForm
              token={token}
              plan={plan}
              prefill={data.prefill}
              onSubmitted={() => setIsSubmitted(true)}
            />
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
