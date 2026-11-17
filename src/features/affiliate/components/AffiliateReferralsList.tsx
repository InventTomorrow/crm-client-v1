"use client";
import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { useAffiliateReferrals } from "../hooks/useAffiliateReferrals";

export function AffiliateReferralsList() {
  const referralsQuery = useAffiliateReferrals(true);
  const referredCustomers = referralsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  if (referralsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <Skeleton key={rowIndex} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (referredCustomers.length === 0) {
    return (
      <p className="py-6 text-center text-[12.5px] text-[var(--ink-mute)]">
        Nobody has signed up with your code yet. Share your link to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      <ul className="divide-y divide-[var(--line)]">
        {referredCustomers.map((referredCustomer) => {
          const hasPaid = referredCustomer.status === "CONVERTED";
          return (
            <li key={referredCustomer.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                {hasPaid ? (
                  <CheckCircle2 size={16} className="shrink-0 text-success-foreground" />
                ) : (
                  <Clock size={16} className="shrink-0 text-[var(--ink-mute)]" />
                )}
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-[var(--ink)]">
                    {referredCustomer.customerName}
                  </div>
                  <div className="truncate text-[11.5px] text-[var(--ink-mute)]">
                    {referredCustomer.code} ·{" "}
                    {hasPaid
                      ? `Paid for ${referredCustomer.planName ?? "a plan"}`
                      : `Joined ${new Date(referredCustomer.createdAt).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
              {hasPaid && referredCustomer.commissionAmount !== null && (
                <div className="shrink-0 text-right">
                  <div className="text-[13px] font-semibold text-[var(--ink)]">
                    {pkr(referredCustomer.commissionAmount)}
                  </div>
                  <div className="text-[11px] text-[var(--ink-mute)]">
                    {referredCustomer.isCommissionPaid ? "Paid to you" : "Pending payout"}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {referralsQuery.hasNextPage && (
        <Button
          variant="outline"
          className="mt-3 self-center"
          onClick={() => referralsQuery.fetchNextPage()}
          disabled={referralsQuery.isFetchingNextPage}
        >
          {referralsQuery.isFetchingNextPage && <Loader2 className="animate-spin" />}
          Load more
        </Button>
      )}
    </div>
  );
}
