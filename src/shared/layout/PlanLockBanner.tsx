"use client";
import { Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/Button";
import type { EntitlementStatus } from "@/features/billing/types";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

/**
 * Persistent notice shown across the app once the plan is dead.
 *
 * The workspace stays readable in this state, so the banner has to carry the
 * whole explanation — otherwise a customer meets the restriction only as a
 * failed save with no context. It says what still works before what doesn't,
 * because the first question an expired customer has is whether their data
 * survived.
 */
export function PlanLockBanner({ entitlement }: { entitlement: EntitlementStatus }) {
  const { isOwner } = usePermissions();

  const heading =
    entitlement.reason === "expired"
      ? `Your ${entitlement.planName ?? "plan"} has ended`
      : "No active plan";

  return (
    <div className="border-b border-[var(--line)] bg-warning-soft px-4 py-3 md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)]">
            <Lock size={14} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[var(--ink)]">{heading}</div>
            <p className="text-[13px] text-[var(--ink-mute)]">
              Everything you have is still here and still readable. Sending, WhatsApp and
              adding new items are paused until{" "}
              {isOwner ? "you renew" : "the workspace owner renews"}.
            </p>
          </div>
        </div>

        {isOwner && (
          <Button asChild size="sm" className="shrink-0 self-start sm:self-auto">
            <Link href="/pricing">Choose a plan</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
