"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useCancelSubscription,
  useChangePlan,
  useCreateCheckout,
  usePlanRequest,
  usePlans,
  useReactivateSubscription,
  useRequestPlan,
  useSubscription,
} from "../hooks/useBilling";
import type { Plan } from "../types";
import { BillingHistory } from "./BillingHistory";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";
import { PlanGrid } from "./PlanGrid";
import { PlanRequestCard } from "./PlanRequestCard";
import { PlanUsageCard } from "./PlanUsageCard";

const CHECKOUT_MODE: "manual" | "gateway" = "gateway";

function BillingViewInner() {
  const params = useSearchParams();
  const returnStatus = params.get("status"); // success | cancelled (Safepay return)
  const { tenant } = useCurrentTenant();

  // Poll the subscription while we wait for the activation webhook.
  const polling = returnStatus === "success";
  const { data: subscription, isLoading: subLoading } =
    useSubscription(polling);
  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: latestPlanRequest } = usePlanRequest();

  const checkout = useCreateCheckout();
  const requestPlan = useRequestPlan();
  const changePlan = useChangePlan();
  const cancel = useCancelSubscription();
  const reactivate = useReactivateSubscription();

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [selectingPlanId, setSelectingPlanId] = useState<string | null>(null);

  // One-time toast for the redirect outcome.
  useEffect(() => {
    if (returnStatus === "success") {
      toast.success("Payment received — activating your subscription…");
    } else if (returnStatus === "cancelled") {
      toast.info("Checkout cancelled");
    }
  }, [returnStatus]);

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
    if (CHECKOUT_MODE === "manual") {
      // Sends the customer to their own /subscribe/:token page to enter
      // details and upload a payment receipt; the admin then approves it.
      // Deliberately no onSettled reset — the hook navigates away on success,
      // and clearing the spinner first would flash the button back to idle.
      requestPlan.mutate(plan.id, { onError: () => setSelectingPlanId(null) });
      return;
    }
    checkout.mutate(plan.id, { onSettled: () => setSelectingPlanId(null) });
  };

  // Approved requests already surface as the subscription; expired ones were
  // superseded — only pending/rejected ones are worth showing.
  const visiblePlanRequest =
    latestPlanRequest &&
    (latestPlanRequest.status === "PENDING_APPROVAL" ||
      latestPlanRequest.status === "REJECTED")
      ? latestPlanRequest
      : null;
  const requestedPlanId =
    latestPlanRequest?.status === "PENDING_APPROVAL"
      ? latestPlanRequest.planId
      : null;

  return (
    // Capped and centred — full-bleed rows push a label and its value to
    // opposite edges of a wide screen, which is unreadable.
    <div className="mx-auto w-full max-w-[1100px] space-y-8">
      <div>
        <h2 className="text-[20px] font-semibold">
          Billing &amp; Subscription
        </h2>
        <p className="text-[13px] mt-1 text-[var(--ink-soft)]">
          Manage your workspace plan and view payment history.
        </p>
      </div>

      <div className="space-y-4">
        {subLoading ? (
          <div className="card p-5 text-[13px] text-[var(--ink-soft)] sm:p-[22px]">
            Loading…
          </div>
        ) : subscription ? (
          <CurrentSubscriptionCard
            subscription={subscription}
            onCancel={() => setConfirmCancel(true)}
            isCancelling={cancel.isPending}
            onReactivate={() => reactivate.mutate()}
            isReactivating={reactivate.isPending}
          />
        ) : (
          <div className="card p-5 text-[13px] text-[var(--ink-soft)] sm:p-[22px]">
            You don&apos;t have an active subscription. Choose a plan below to
            get started.
          </div>
        )}

        {visiblePlanRequest && <PlanRequestCard request={visiblePlanRequest} />}

        {subscription?.plan && (
          <PlanUsageCard
            subscription={subscription}
            tenantVertical={tenant?.businessVertical}
          />
        )}
      </div>

      <div>
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold">
            {subscription ? "Change plan" : "Plans"}
          </h3>
          <p className="text-[13px] mt-0.5 text-[var(--ink-soft)]">
            {subscription
              ? "Switch to a different plan at any time."
              : "Pick the plan that fits your workspace."}
          </p>
        </div>
        {plansLoading ? (
          <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">
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
            isMutating={
              changePlan.isPending ||
              (CHECKOUT_MODE === "manual"
                ? requestPlan.isPending
                : checkout.isPending)
            }
            tenantVertical={tenant?.businessVertical}
            checkoutMode={CHECKOUT_MODE}
            onSelect={handleSelect}
          />
        )}
      </div>

      <BillingHistory />

      {/* Full-screen hold while the browser navigates to /subscribe/<token>.
          window.location.assign isn't instant, and without this the page sits
          looking idle after the click. */}
      {requestPlan.isPending && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[var(--bg)]/80 backdrop-blur-sm">
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
          <p className="text-[14px] font-medium text-[var(--ink)]">
            Taking you to checkout…
          </p>
          <p className="text-[12.5px] text-[var(--ink-mute)]">
            You&apos;ll confirm your details and upload your payment receipt.
          </p>
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={() =>
          cancel.mutate(undefined, { onSettled: () => setConfirmCancel(false) })
        }
        title="Cancel subscription?"
        description="Your plan stays active until the end of the current billing period, after which it will not renew."
        confirmLabel="Cancel subscription"
        cancelLabel="Keep plan"
        loading={cancel.isPending}
      />
    </div>
  );
}

export function BillingView() {
  return (
    <Suspense
      fallback={
        <div className="card p-[22px] text-[13px] text-[var(--ink-soft)]">
          Loading…
        </div>
      }
    >
      <BillingViewInner />
    </Suspense>
  );
}
