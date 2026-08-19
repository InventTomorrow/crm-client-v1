"use client";
import { AlertTriangle, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useSubscription } from "@/features/billing/hooks/useBilling";
import { SidebarOfferTimer } from "@/features/offers/components/SidebarOfferTimer";
import { useActiveOffer } from "@/features/offers/hooks/useActiveOffer";
import { useOfferEligibility } from "@/features/offers/hooks/useOfferEligibility";

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

interface PromptCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string | null;
  cta: string;
  tone?: "accent" | "warning";
}

function PromptCard({ icon, title, subtitle, cta, tone = "accent" }: PromptCardProps) {
  const isWarning = tone === "warning";
  return (
    <div
      className={
        isWarning
          ? "flex flex-col gap-2 rounded-lg border border-warning/25 bg-warning-soft px-3 py-2.5"
          : "flex flex-col gap-2 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-3 py-2.5"
      }
    >
      <div
        className={
          isWarning
            ? "flex items-center gap-1.5 text-[12px] font-semibold text-warning-foreground"
            : "flex items-center gap-1.5 text-[12px] font-semibold text-[var(--accent)]"
        }
      >
        {icon}
        {title}
      </div>
      {subtitle && <div className="text-[10.5px] text-[var(--ink-mute)]">{subtitle}</div>}
      <Link
        href="/settings/billing"
        className={
          isWarning
            ? "mt-0.5 flex items-center justify-center gap-1 rounded-md bg-warning px-2.5 py-1.5 text-[11.5px] font-semibold text-warning-foreground no-underline transition-opacity hover:opacity-90"
            : "mt-0.5 flex items-center justify-center gap-1 rounded-md bg-[var(--accent)] px-2.5 py-1.5 text-[11.5px] font-semibold text-white no-underline transition-opacity hover:opacity-90"
        }
      >
        {cta} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

/** Sidebar footer upsell — reflects the workspace's actual subscription state. */
export function SidebarOfferCard() {
  const { data: subscription, isLoading } = useSubscription();
  const { data: offer } = useActiveOffer();
  const { isEligible } = useOfferEligibility();
  if (isLoading) return null;

  // A live campaign takes over the upsell slot entirely — it is the stronger
  // prompt, and it is the one surface the user cannot dismiss, so the trial
  // deadline rides along as its subtitle rather than as a second card.
  if (offer && isEligible) {
    const trialDays = daysUntil(subscription?.trialEndsAt ?? null);
    return (
      <SidebarOfferTimer
        offer={offer}
        subtitle={
          subscription?.status === "TRIALING" && trialDays !== null
            ? `Trial ends in ${trialDays} day${trialDays === 1 ? "" : "s"}`
            : null
        }
      />
    );
  }

  if (!subscription) {
    return <PromptCard icon={<Zap size={12} className="shrink-0" />} title="Choose a plan to get started" cta="View plans" />;
  }

  if (subscription.status === "PAST_DUE") {
    return (
      <PromptCard
        icon={<AlertTriangle size={12} className="shrink-0" />}
        title="Payment past due"
        subtitle="Update your payment to keep your workspace active."
        cta="Fix billing"
        tone="warning"
      />
    );
  }

  // Cancel-at-period-end: status still reads ACTIVE/TRIALING, but the plan
  // won't renew — worth a prompt before it actually lapses.
  if (subscription.cancelledAt && (subscription.status === "ACTIVE" || subscription.status === "TRIALING")) {
    const days = daysUntil(subscription.currentPeriodEnd);
    return (
      <PromptCard
        icon={<AlertTriangle size={12} className="shrink-0" />}
        title={days !== null ? `Access ends in ${days} day${days === 1 ? "" : "s"}` : "Subscription won't renew"}
        subtitle="Pick a plan to keep your workspace active."
        cta="Choose a plan"
        tone="warning"
      />
    );
  }

  if (subscription.status === "TRIALING") {
    const days = daysUntil(subscription.trialEndsAt);
    return (
      <PromptCard
        icon={<Zap size={12} className="shrink-0" />}
        title={days !== null ? `Trial ends in ${days} day${days === 1 ? "" : "s"}` : "Trial active"}
        subtitle={subscription.plan?.name}
        cta="Upgrade now"
      />
    );
  }

  // ACTIVE, not on a trial, not cancelled — no upsell needed.
  if (subscription.status === "ACTIVE") return null;

  // CANCELLED (or cancel-at-period-end already elapsed) — re-prompt.
  return <PromptCard icon={<Zap size={12} className="shrink-0" />} title="Your subscription has ended" cta="Renew plan" />;
}
