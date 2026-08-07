import {
  BUSINESS_VERTICALS,
  getBusinessVerticalShortLabel,
  hasCapability,
  type BusinessVertical,
} from "@/lib/business-verticals";
import type { WorkspaceStats } from "@/features/tenant/types";
import { Calendar, TrendingUp, Users, UserPlus, type LucideIcon } from "lucide-react";

export interface WorkspaceCardTile {
  label: string;
  value: string;
  Icon: LucideIcon;
}

/** Icon + short label for the category chip on a workspace card. */
export function getBusinessCategoryBadge(businessVertical: BusinessVertical) {
  const option = BUSINESS_VERTICALS.find((v) => v.value === businessVertical);
  return {
    label: getBusinessVerticalShortLabel(businessVertical),
    Icon: option?.icon ?? Users,
  };
}

/** Compact money — a workspace card has no room for full PKR digits. */
function formatRevenue(revenue: number): string {
  if (revenue >= 1_000_000) return `${(revenue / 1_000_000).toFixed(1)}M`;
  if (revenue >= 1_000) return `${Math.round(revenue / 1_000)}K`;
  return revenue.toLocaleString();
}

/**
 * The three counters a workspace card shows. Order verticals close on revenue;
 * booking verticals close on appointments, so the third tile swaps by capability
 * rather than every card carrying a permanently-zero Revenue figure.
 */
export function buildWorkspaceCardTiles(
  businessVertical: BusinessVertical,
  stats: WorkspaceStats | undefined,
): WorkspaceCardTile[] {
  const closingTile: WorkspaceCardTile = hasCapability(businessVertical, "ORDERS")
    ? {
        label: "Revenue",
        value: stats ? formatRevenue(stats.revenue) : "—",
        Icon: TrendingUp,
      }
    : {
        label: "Bookings",
        value: stats ? stats.appointments.toLocaleString() : "—",
        Icon: Calendar,
      };

  return [
    { label: "Leads", value: stats ? stats.leads.toLocaleString() : "—", Icon: UserPlus },
    { label: "Members", value: stats ? stats.members.toLocaleString() : "—", Icon: Users },
    closingTile,
  ];
}
