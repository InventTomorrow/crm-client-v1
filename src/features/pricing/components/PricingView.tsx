"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, Receipt, Headphones } from "lucide-react";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import {
  useChangePlan,
  useEntitlementStatus,
  usePlanRequest,
  usePlans,
  useRequestPlan,
  useSubscription,
  useSupportContact,
} from "@/features/billing/hooks/useBilling";
import { PlanGrid } from "@/features/billing/components/PlanGrid";
import { PlanRequestCard } from "@/features/billing/components/PlanRequestCard";
import type { Plan } from "@/features/billing/types";

const CHECKOUT_MODE: "manual" | "gateway" = "manual";

/**
 * The one place a plan is chosen. Billing keeps the current subscription and
 * its paper trail; picking or changing a plan happens here, so a customer sent
 * from an expired-plan redirect, the trial reminder or the landing page all
 * land somewhere that can actually complete the purchase.
 */
export function PricingView() {
  const { tenant } = useCurrentTenant();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: latestPlanRequest } = usePlanRequest();
  const { data: entitlement } = useEntitlementStatus();
  const { data: supportContact } = useSupportContact();

  const requestPlan = useRequestPlan();
  const changePlan = useChangePlan();
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);

  // Cancel-at-period-end leaves status ACTIVE/TRIALING with cancelledAt set —
  // that subscription is no longer "current" for plan-selection purposes.
  const activePlanId =
    subscription &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIALING") &&
    !subscription.cancelledAt
      ? subscription.planId
      : null;

  const handleSelect = (plan: Plan) => {
    setSelectingPlanId(plan.id);
    // Switching from a live plan is an upgrade or a downgrade, each with its
    // own rules — only a first purchase goes straight to checkout.
    if (activePlanId) {
      changePlan.mutate(plan.id, { onSettled: () => setSelectingPlanId(null) });
      return;
    }
    // Deliberately no onSettled reset — the hook navigates away on success,
    // and clearing the spinner first would flash the button back to idle.
    requestPlan.mutate(plan.id, { onError: () => setSelectingPlanId(null) });
  };

  const visiblePlanRequest =
    latestPlanRequest &&
    (latestPlanRequest.status === "PENDING_APPROVAL" ||
      latestPlanRequest.status === "REJECTED")
      ? latestPlanRequest
      : null;
  const requestedPlanId =
    latestPlanRequest?.status === "PENDING_APPROVAL" ? latestPlanRequest.planId : null;

  const expired = entitlement && !entitlement.live;

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold">Plans &amp; Pricing</h2>
        <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
          {expired
            ? "Your plan has ended. Choose one below to unlock your workspaces again."
            : "Choose the plan that fits your workspace. Change or cancel whenever you like."}
        </p>
      </div>

      {expired && (
        <div className="card border-[var(--warning)] bg-warning-soft p-4 text-[13px] text-warning-foreground sm:p-5">
          {entitlement?.reason === "expired"
            ? `Your ${entitlement.planName ?? "plan"} has ended, so your workspaces are locked until you pick a plan.`
            : "This account has no active plan yet."}
        </div>
      )}

      {visiblePlanRequest && <PlanRequestCard request={visiblePlanRequest} />}

      {subscriptionLoading || plansLoading ? (
        <div className="card flex items-center gap-2 p-5 text-[13px] text-[var(--ink-soft)]">
          <Loader2 size={14} className="animate-spin" />
          Loading plans…
        </div>
      ) : (
        <PlanGrid
          plans={plans ?? []}
          activePlanId={activePlanId}
          requestedPlanId={requestedPlanId}
          scheduledPlanId={subscription?.pendingPlanId ?? null}
          activePlanPrice={activePlanId ? (subscription?.plan?.price ?? null) : null}
          selectingPlanId={selectingPlanId}
          isMutating={changePlan.isPending || requestPlan.isPending}
          tenantVertical={tenant?.businessVertical}
          checkoutMode={CHECKOUT_MODE}
          onSelect={handleSelect}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <InfoCard
          icon={<Receipt size={16} />}
          title="How payment works"
          body="Transfer the plan amount, upload your receipt on the checkout page, and we activate your plan once it's verified."
        />
        <InfoCard
          icon={<ShieldCheck size={16} />}
          title="Changing plans"
          body="Upgrades start as soon as they're paid for. Downgrades and cancellations take effect at the end of the period you've already paid for, never sooner."
        />
        <InfoCard
          icon={<Headphones size={16} />}
          title="Need help choosing?"
          body={
            supportContact?.supportPhone || supportContact?.supportEmail
              ? `Talk to us at ${supportContact.supportPhone ?? supportContact.supportEmail}.`
              : "Get in touch and we'll help you pick the right plan."
          }
        />
      </div>

      <p className="text-center text-[12.5px] text-[var(--ink-mute)]">
        Looking for invoices or payment history?{" "}
        <Link href="/settings/billing" className="text-[var(--accent)] hover:underline">
          Go to Billing
        </Link>
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-[var(--ink)]">
        <span className="text-[var(--accent)]">{icon}</span>
        <h3 className="text-[13.5px] font-semibold">{title}</h3>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{body}</p>
    </div>
  );
}
