import type { BusinessVertical } from "@/lib/business-verticals";

/** Tour ids. Mirrors TOUR_IDS in server/src/modules/auth/auth.dto.ts. */
export const TOUR_IDS = [
  "workspace-ecommerce-v1",
  "workspace-restaurant-v1",
  "workspace-agency-v1",
] as const;
export type TourId = (typeof TOUR_IDS)[number];

export const TOUR_ID_BY_VERTICAL: Record<BusinessVertical, TourId> = {
  ECOMMERCE: "workspace-ecommerce-v1",
  RESTAURANT: "workspace-restaurant-v1",
  MARKETING_AGENCY: "workspace-agency-v1",
};

/** Below this width the sidebar is replaced by MobileDock, so most targets are absent. */
export const TOUR_MIN_VIEWPORT_WIDTH = 768;
