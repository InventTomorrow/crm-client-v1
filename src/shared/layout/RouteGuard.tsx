"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useEntitlementStatus } from "@/features/billing/hooks/useBilling";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { Button } from "@/shared/ui/Button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { hasCapability } from "@/lib/business-verticals";
import { PlanLockBanner } from "./PlanLockBanner";
import { getRequiredCapability, getRequiredPermission } from "./routePermissions";

// Pages that already explain the plan state themselves — banner would be noise.
const BANNER_SUPPRESSED_PREFIXES = ["/pricing", "/settings/billing"];

/**
 * Client-side gate for `(app)` pages. Resolves the permission required by the
 * current route and blocks render when the active role lacks it. The server
 * still enforces every mutation — this only stops a user landing on a page they
 * have no access to.
 *
 * A dead plan is deliberately NOT a gate here. The workspace stays fully
 * readable so a customer never loses sight of their own conversations, leads
 * and orders; the server rejects the writes, and the banner explains why. The
 * old behaviour bounced owners to /pricing from every route, which read as
 * "your data is gone" rather than "your plan lapsed".
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can, isLoading } = usePermissions();
  const { tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const { data: entitlement } = useEntitlementStatus();
  const required = getRequiredPermission(pathname);
  const requiredCapability = getRequiredCapability(pathname);

  // Wait for both to resolve so we never flash "no access" on load, and never
  // render a page left over from the previous (still-unmounting) workspace.
  if (isLoading || isTenantLoading) return null;

  const showsPlanLock =
    !!entitlement &&
    !entitlement.live &&
    !BANNER_SUPPRESSED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const withBanner = (content: React.ReactNode) => (
    <>
      {showsPlanLock && entitlement && <PlanLockBanner entitlement={entitlement} />}
      {content}
    </>
  );

  if (requiredCapability && tenant && !hasCapability(tenant.businessVertical, requiredCapability)) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="card flex max-w-sm flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)]">
            <Lock size={20} />
          </div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">
            Not available for this workspace
          </div>
          <p className="text-[13px] text-[var(--ink-mute)]">
            This page isn&apos;t available for this workspace&apos;s business type.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!required || can(required)) return withBanner(children);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="card flex max-w-sm flex-col items-center gap-3 p-8 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)]">
          <Lock size={20} />
        </div>
        <div className="text-[15px] font-semibold text-[var(--ink)]">
          You don&apos;t have access
        </div>
        <p className="text-[13px] text-[var(--ink-mute)]">
          Your role doesn&apos;t include permission to view this page. Ask a
          workspace owner if you need access.
        </p>
        <Button asChild variant="outline" size="sm" className="mt-1">
          <Link href="/inbox">Back to Inbox</Link>
        </Button>
      </div>
    </div>
  );
}
