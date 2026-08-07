"use client";
import { hasCapability } from "@/lib/business-verticals";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { Button } from "@/shared/ui/Button";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export function OrderApiCard() {
  const { tenant } = useCurrentTenant();

  // Gated here rather than at each call site — the channels grid and the
  // settings channels tab both render it.
  if (!hasCapability(tenant?.businessVertical, "ORDERS")) return null;

  return (
    <div className="card hover-shimmer p-5 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[var(--accent-soft)] text-[var(--accent)]">
          <LinkIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[14px]">Website Orders API</div>
          <div className="text-[12px] text-[var(--ink-mute)] mt-px">
            Connect your storefront or website so confirmed orders create CRM
            orders automatically.
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/channels/order-api">Manage</Link>
        </Button>
      </div>
    </div>
  );
}
