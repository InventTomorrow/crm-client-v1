"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { hasCapability } from "@/lib/business-verticals";
import { Button } from "@/shared/ui/Button";
import { Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { API_WORKSPACE_ROOT } from "../utils/apiWorkspaceSections";

export function WebsiteApiCard() {
  const { tenant } = useCurrentTenant();

  // API keys are ORDERS-gated on the server, so the card hides for other verticals.
  if (!hasCapability(tenant?.businessVertical, "ORDERS")) return null;

  return (
    <div className="card hover-shimmer p-5 transition-colors hover:bg-[var(--surface-2)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <LinkIcon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold">Website API</div>
          <div className="mt-0.5 text-[13px] leading-5 text-[var(--ink-mute)]">
            Create CRM orders from your website or storefront, with a WhatsApp
            confirmation to the customer.
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`${API_WORKSPACE_ROOT}/keys`}>Manage</Link>
        </Button>
      </div>
    </div>
  );
}
