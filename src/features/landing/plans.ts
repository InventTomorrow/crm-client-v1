import { formatOfferCountdown } from "./constants";

/**
 * Pricing content for the public landing page.
 *
 * Everything a card renders comes from the plan catalogue in the admin portal
 * — nothing here is hardcoded, so publishing a plan or editing its price,
 * bullets, badge or CTA changes the marketing site with no deploy.
 */

/** Shape the card renders. Prices arrive pre-formatted; the view does no maths. */
export type Plan = {
  id: string;
  name: string;
  tagline: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: number;
  /** Coarse fallback label — only used when there is no live campaign to tick. */
  offerCountdown?: string;
  /** ISO deadline the card counts down to, when an offer is running. */
  offerEndsAt?: string;
  period: string;
  cta: string;
  featured: boolean;
  comingSoon: boolean;
  features: string[];
};

/** The public endpoint's projection — see server/modules/plans/public-plans.repository.ts. */
interface PublicPlanDto {
  id: string;
  name: string;
  tagline: string | null;
  features: string[];
  price: number;
  originalPrice: number | null;
  offerEndsAt: string | null;
  // Set by the platform-wide campaign; null when none is running. `price`
  // stays the undiscounted list price either way.
  offerPrice: number | null;
  offerDiscountPercent: number | null;
  currency: string;
  duration: string;
  customDurationDays: number | null;
  isTrial: boolean;
  isFeatured: boolean;
  isComingSoon: boolean;
  ctaLabel: string | null;
  maxWorkspaces: number;
  maxMembersPerWorkspace: number;
  maxChannels: number;
  maxMonthlyMessages: number;
}

const PERIOD_LABEL: Record<string, string> = {
  DAYS_3: "/3 days",
  DAYS_7: "/week",
  DAYS_14: "/2 weeks",
  MONTHLY: "/month",
  QUARTERLY: "/quarter",
  SEMI_ANNUAL: "/6 months",
  ANNUAL: "/year",
};

function periodLabel(
  duration: string,
  customDurationDays: number | null,
): string {
  if (duration === "CUSTOM_DAYS") {
    const days = customDurationDays ?? 0;
    return `/${days} day${days === 1 ? "" : "s"}`;
  }
  return PERIOD_LABEL[duration] ?? "/month";
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-PK");
}

/** Days left on an offer, as a coarse label for cards that can't tick. */
function offerCountdown(offerEndsAt: string): string {
  const diffMs = new Date(offerEndsAt).getTime() - Date.now();
  return formatOfferCountdown(
    Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24))),
  );
}

/**
 * Headline limits stand in when an admin hasn't written bullets for a plan, so
 * a card is never published empty.
 */
function fallbackFeatures(plan: PublicPlanDto): string[] {
  const plural = (count: number, noun: string) =>
    `${formatAmount(count)} ${noun}${count === 1 ? "" : "s"}`;
  return [
    plural(plan.maxWorkspaces, "workspace"),
    `${plural(plan.maxMembersPerWorkspace, "team member")} per workspace`,
    plural(plan.maxChannels, "WhatsApp channel"),
    `${formatAmount(plan.maxMonthlyMessages)} AI messages / month`,
  ];
}

/**
 * Which discount a card advertises. The platform campaign wins outright when
 * one is running, so a plan carrying its own older offer never puts a second,
 * contradicting countdown on the same page.
 */
function resolveDiscount(dto: PublicPlanDto): {
  listPrice: number;
  payPrice: number;
  discountPercentage: number;
} | null {
  if (dto.isTrial) return null;

  if (dto.offerPrice !== null && dto.offerDiscountPercent !== null) {
    return {
      listPrice: dto.price,
      payPrice: dto.offerPrice,
      discountPercentage: dto.offerDiscountPercent,
    };
  }

  if (dto.originalPrice !== null && dto.originalPrice > dto.price) {
    return {
      listPrice: dto.originalPrice,
      payPrice: dto.price,
      discountPercentage: Math.round((1 - dto.price / dto.originalPrice) * 100),
    };
  }

  return null;
}

function toPlan(dto: PublicPlanDto): Plan {
  const discount = resolveDiscount(dto);

  return {
    id: dto.id,
    name: dto.name,
    tagline: dto.tagline ?? "",
    price: dto.isTrial ? "0" : formatAmount(discount?.payPrice ?? dto.price),
    ...(discount ? { originalPrice: formatAmount(discount.listPrice) } : {}),
    ...(discount ? { discountPercentage: discount.discountPercentage } : {}),
    ...(discount && dto.offerEndsAt
      ? { offerCountdown: offerCountdown(dto.offerEndsAt), offerEndsAt: dto.offerEndsAt }
      : {}),
    period: periodLabel(dto.duration, dto.customDurationDays),
    cta: dto.ctaLabel?.trim() || `Start with ${dto.name}`,
    featured: dto.isFeatured,
    comingSoon: dto.isComingSoon,
    features: dto.features.length > 0 ? dto.features : fallbackFeatures(dto),
  };
}

export async function fetchLandingPlans(): Promise<Plan[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/v1/public/plans`,
      {
        // Matches the promo endpoint's window on purpose: plan prices carry the
        // campaign discount, so a longer cache here would leave the banner
        // advertising a discount the cards below it are not showing yet.
        next: { revalidate: 60 },
      },
    );
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: PublicPlanDto[] };
    return (payload.data ?? []).map(toPlan);
  } catch {
    // Never let a pricing fetch take the whole marketing page down.
    return [];
  }
}
