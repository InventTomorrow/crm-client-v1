"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useEntitlementStatus } from "@/features/billing/hooks/useBilling";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { Button } from "@/shared/ui/Button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hasCapability } from "@/lib/business-verticals";
import { getRequiredCapability, getRequiredPermission } from "./routePermissions";

// With a dead plan the app is locked except the pages that exist to revive it:
// pricing (choose a plan) and settings (billing history, profile).
const OPEN_WHEN_PLAN_DEAD_PREFIXES = ["/pricing", "/settings"];

/**
 * Sends the owner to /pricing. Rendered rather than redirecting inside the
 * guard body so navigation happens in an effect, not during render.
 */
function PricingRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/pricing");
  }, [router]);
  return null;
}

/**
 * Client-side gate for `(app)` pages. Resolves the permission required by the
 * current route and blocks render when the active role lacks it. The server
 * still enforces every mutation — this only stops a user landing on a page they
 * have no access to.
 */
export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { can, isOwner, isLoading } = usePermissions();
  const { tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const { data: entitlement } = useEntitlementStatus();
  const required = getRequiredPermission(pathname);
  const requiredCapability = getRequiredCapability(pathname);

  // Wait for both to resolve so we never flash "no access" on load, and never
  // render a page left over from the previous (still-unmounting) workspace.
  if (isLoading || isTenantLoading) return null;

  // Expired or missing plan locks everything except the pages that can fix it.
  // The owner is sent straight to pricing — that is the only action available
  // to them, so a card asking them to click through to it is a wasted step.
  // Members can't buy anything, so they get the explanation instead.
  if (
    entitlement &&
    !entitlement.live &&
    !OPEN_WHEN_PLAN_DEAD_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    if (isOwner) return <PricingRedirect />;
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="card flex max-w-sm flex-col items-center gap-3 p-8 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--ink-mute)]">
            <Lock size={20} />
          </div>
          <div className="text-[15px] font-semibold text-[var(--ink)]">
            {entitlement.reason === "expired"
              ? `Your ${entitlement.planName ?? "plan"} has ended`
              : "No active plan"}
          </div>
          <p className="text-[13px] text-[var(--ink-mute)]">
            Ask the workspace owner to renew the plan to restore access.
          </p>
        </div>
      </div>
    );
  }

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

  if (!required) return <>{children}</>;
  if (can(required)) return <>{children}</>;

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
