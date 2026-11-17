"use client";
import { pkr } from "@/lib/utils";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  BadgePercent,
  CheckCircle2,
  Handshake,
  PauseCircle,
  UserPlus,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useAffiliateAnalytics } from "../hooks/useAffiliateAnalytics";
import { useAffiliateProfile } from "../hooks/useAffiliateProfile";
import { ANALYTICS_RANGE_PRESETS, type AffiliateAnalytics } from "../types";
import { AffiliateKpiTile } from "./AffiliateKpiTile";
import { AffiliateReferralsList } from "./AffiliateReferralsList";
import { AffiliateShareCodes } from "./AffiliateShareCodes";

const AffiliateTrendChart = dynamic(() => import("./AffiliateTrendChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] w-full" />,
});

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function EarningsCard({ lifetime }: { lifetime: AffiliateAnalytics["lifetime"] }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[var(--accent)] p-5 text-white shadow-sm">
      <span className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-12 right-16 h-28 w-28 rounded-full bg-white/5" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[12.5px] text-white/80">Waiting to be paid to you</div>
          <div className="mt-1 text-[32px] font-semibold leading-none font-[var(--font-head)]">
            {pkr(lifetime.commissionOwed)}
          </div>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
          <Wallet size={18} />
        </span>
      </div>
      <div className="relative mt-5 grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <div className="text-white/70">Earned all time</div>
          <div className="font-semibold">{pkr(lifetime.commissionEarned)}</div>
        </div>
        <div>
          <div className="text-white/70">Already paid</div>
          <div className="font-semibold">{pkr(lifetime.commissionPaid)}</div>
        </div>
      </div>
    </div>
  );
}

function NotAnAffiliate() {
  return (
    <div className="card mx-auto mt-10 max-w-md p-8 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Handshake size={22} />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold text-[var(--ink)]">
        You are not an affiliate yet
      </h2>
      <p className="mt-1.5 text-[13px] text-[var(--ink-mute)]">
        Affiliates earn commission when businesses they refer start a paid plan. Contact our
        team if you would like to join.
      </p>
    </div>
  );
}

export function AffiliateDashboardView() {
  const profileQuery = useAffiliateProfile();
  const affiliateProfile = profileQuery.data ?? null;
  const { analyticsQuery, rangePreset, setRangePreset } = useAffiliateAnalytics(
    Boolean(affiliateProfile),
  );
  const analytics = analyticsQuery.data;

  if (profileQuery.isLoading) {
    return (
      <div className="flex flex-col gap-3 p-[18px]">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (!affiliateProfile) return <NotAnAffiliate />;

  return (
    <div className="scroll h-full overflow-y-auto p-[18px]">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[20px] font-semibold">Affiliate dashboard</h2>
          <div className="mt-0.5 text-[12.5px] text-[var(--ink-mute)]">
            Hi {affiliateProfile.name}, you earn {affiliateProfile.commissionPercent}% on each
            referred account&apos;s first payment.
          </div>
        </div>
        <div className="seg">
          {ANALYTICS_RANGE_PRESETS.map((preset) => (
            <button
              key={preset}
              className={rangePreset === preset ? "on" : ""}
              onClick={() => setRangePreset(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {affiliateProfile.status === "PAUSED" && (
        <div className="mb-3.5 flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5 text-[12.5px] text-[var(--ink-soft)]">
          <PauseCircle size={15} className="shrink-0 text-[var(--ink-mute)]" />
          Your codes are paused, so new sign-ups can&apos;t use them. Earlier referrals still
          count.
        </div>
      )}

      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
          {!analytics ? (
            Array.from({ length: 4 }, (_, tileIndex) => (
              <Skeleton key={tileIndex} className="h-[120px] w-full" />
            ))
          ) : (
            <>
              <AffiliateKpiTile
                label="Sign-ups"
                value={analytics.totals.signups.toLocaleString()}
                icon={UserPlus}
                change={percentChange(analytics.totals.signups, analytics.previousTotals.signups)}
              />
              <AffiliateKpiTile
                label="Paid customers"
                value={analytics.totals.conversions.toLocaleString()}
                icon={CheckCircle2}
                change={percentChange(
                  analytics.totals.conversions,
                  analytics.previousTotals.conversions,
                )}
                hint={
                  analytics.totals.conversionRate === null
                    ? undefined
                    : `${analytics.totals.conversionRate}% of sign-ups paid`
                }
              />
              <AffiliateKpiTile
                label="Revenue you brought in"
                value={pkr(analytics.totals.revenue)}
                icon={BadgePercent}
                change={percentChange(analytics.totals.revenue, analytics.previousTotals.revenue)}
              />
              <AffiliateKpiTile
                label="Commission earned"
                value={pkr(analytics.totals.commissionEarned)}
                icon={Wallet}
                change={percentChange(
                  analytics.totals.commissionEarned,
                  analytics.previousTotals.commissionEarned,
                )}
              />
            </>
          )}
        </div>
        {analytics ? (
          <EarningsCard lifetime={analytics.lifetime} />
        ) : (
          <Skeleton className="h-full min-h-[160px] w-full" />
        )}
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="card p-[18px]">
          <h3 className="text-[14px] font-semibold">Performance</h3>
          <div className="mb-2.5 text-[12px] text-[var(--ink-mute)]">
            Sign-ups, paid customers and revenue over the selected period
          </div>
          {analytics ? (
            <AffiliateTrendChart trend={analytics.trend} granularity={analytics.granularity} />
          ) : (
            <Skeleton className="h-[280px] w-full" />
          )}
        </div>
        <div className="card p-[18px]">
          <h3 className="mb-3 text-[14px] font-semibold">Your codes</h3>
          <AffiliateShareCodes codes={affiliateProfile.codes} />
        </div>
      </div>

      <div className="card p-[18px]">
        <h3 className="text-[14px] font-semibold">People you referred</h3>
        <div className="mb-2 text-[12px] text-[var(--ink-mute)]">
          Names are shortened to protect their privacy
        </div>
        <AffiliateReferralsList />
      </div>
    </div>
  );
}
