import {
  Megaphone,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type BusinessVertical = "ECOMMERCE" | "RESTAURANT" | "MARKETING_AGENCY";

/**
 * What a workspace can do, derived from its vertical. Nav items and route
 * guards gate on these instead of listing verticals, so adding a vertical is a
 * single entry in VERTICAL_CAPABILITIES rather than an edit in every menu.
 * Mirrors the server's vertical registry.
 */
export type VerticalCapability =
  | "CATALOG_PRODUCTS"
  | "CATALOG_MENU"
  | "CATALOG_SERVICES"
  | "ORDERS"
  | "QUALIFICATION"
  | "BOOKINGS"
  | "FOLLOW_UPS"
  | "RESOURCES";

export interface BusinessVerticalOption {
  value: BusinessVertical;
  title: string;
  description: string;
  icon: LucideIcon;
}

// Shared between onboarding's category step and the settings business-section
// editor — one list, one place to add a future vertical.
export const BUSINESS_VERTICALS: BusinessVerticalOption[] = [
  {
    value: "MARKETING_AGENCY",
    title: "Marketing agency",
    description:
      "You sell services, packages, lead qualification, and booked calls.",
    icon: Megaphone,
  },
  {
    value: "ECOMMERCE",
    title: "Online Store / Retail",
    description:
      "You sell products, browsing, stock, pricing, and order tracking.",
    icon: ShoppingBag,
  },
  {
    value: "RESTAURANT",
    title: "Restaurant / Food Service",
    description:
      "You take food orders, menu browsing, dishes, and order tracking.",
    icon: UtensilsCrossed,
  },
];

/** Tuple form for Zod enums — derived from the list above so schemas can't drift from it. */
export const BUSINESS_VERTICAL_VALUES = BUSINESS_VERTICALS.map(
  (v) => v.value,
) as [BusinessVertical, ...BusinessVertical[]];

const BUSINESS_VERTICAL_SHORT_LABELS: Record<BusinessVertical, string> = {
  ECOMMERCE: "Retail",
  RESTAURANT: "Restaurant",
  MARKETING_AGENCY: "Agency",
};

const VERTICAL_CAPABILITIES: Record<BusinessVertical, VerticalCapability[]> = {
  ECOMMERCE: ["CATALOG_PRODUCTS", "ORDERS"],
  RESTAURANT: ["CATALOG_MENU", "ORDERS"],
  MARKETING_AGENCY: [
    "CATALOG_SERVICES",
    "QUALIFICATION",
    "BOOKINGS",
    "FOLLOW_UPS",
    "RESOURCES",
  ],
};

/** Short label for compact UI (workspace switcher, tenant tabs) — the full title is too long for a badge. */
export function getBusinessVerticalShortLabel(
  businessVertical: BusinessVertical,
): string {
  return BUSINESS_VERTICAL_SHORT_LABELS[businessVertical];
}

export function capabilitiesFor(
  businessVertical: BusinessVertical,
): VerticalCapability[] {
  return VERTICAL_CAPABILITIES[businessVertical] ?? [];
}

export function hasCapability(
  businessVertical: BusinessVertical | undefined,
  capability: VerticalCapability,
): boolean {
  // No tenant loaded yet — stay permissive so nav doesn't flicker on first paint.
  if (!businessVertical) return true;
  return capabilitiesFor(businessVertical).includes(capability);
}
