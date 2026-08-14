"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { Button } from "@/shared/ui/Button";
import {
  useCancelSubscription,
  usePlanRequest,
  useReactivateSubscription,
  useSubscription,
} from "../hooks/useBilling";
import { BillingHistory } from "./BillingHistory";
import { CurrentSubscriptionCard } from "./CurrentSubscriptionCard";
import { PlanRequestCard } from "./PlanRequestCard";
import { PlanUsageCard } from "./PlanUsageCard";

/**
 * The account's billing record: what it is on now, what it has used, and what
 * it has paid. Choosing or changing a plan lives on /pricing — keeping the
 * catalogue out of here means there is exactly one place to buy from.
 */
function BillingViewInner() {
  const params = useSearchParams();
  const returnStatus = params.get("status"); // success | cancelled (gateway return)
  const { tenant } = useCurrentTenant();

  // Poll the subscription while we wait for the activation webhook.
  const polling = returnStatus === "success";
  const { data: subscription, isLoading: subLoading } = useSubscription(polling);
  const { data: latestPlanRequest } = usePlanRequest();

  const cancel = useCancelSubscription();
  const reactivate = useReactivateSubscription();
  const [confirmCancel, setConfirmCancel] = useState(false);

  // One-time toast for the redirect outcome.
  useEffect(() => {
    if (returnStatus === "success") {
      toast.success("Payment received — activating your subscription…");
    } else if (returnStatus === "cancelled") {
      toast.info("Checkout cancelled");
    }
  }, [returnStatus]);

  // Approved requests already surface as the subscription; expired ones were
  // superseded — only pending/rejected ones are worth showing.
  const visiblePlanRequest =
    latestPlanRequest &&
    (latestPlanRequest.status === "PENDING_APPROVAL" ||
      latestPlanRequest.status === "REJECTED")
      ? latestPlanRequest
      : null;

  return (
    // Capped and centred — full-bleed rows push a label and its value to
    // opposite edges of a wide screen, which is unreadable.
    <div className="mx-auto w-full max-w-[1100px] space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold">Billing &amp; Subscription</h2>
          <p className="mt-1 text-[13px] text-[var(--ink-soft)]">
            Your current plan, usage and payment history.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/pricing">
            {subscription ? "Change plan" : "Choose a plan"}
            <ArrowUpRight size={14} />
          </Link>
        </Button>
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
            You don&apos;t have an active subscription.{" "}
            <Link href="/pricing" className="text-[var(--accent)] hover:underline">
              Choose a plan
            </Link>{" "}
            to get started.
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

      <BillingHistory />

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
