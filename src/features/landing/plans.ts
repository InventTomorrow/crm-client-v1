import { formatOfferCountdown, getOfferDaysRemaining } from "./constants";

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
  offerCountdown?: string;
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

/** Days left on this plan's own offer, falling back to the site-wide campaign. */
function offerCountdown(offerEndsAt: string | null): string {
  if (!offerEndsAt) return formatOfferCountdown(getOfferDaysRemaining());
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

function toPlan(dto: PublicPlanDto): Plan {
  const hasOffer =
    !dto.isTrial && dto.originalPrice !== null && dto.originalPrice > dto.price;
  const discountPercentage = hasOffer
    ? Math.round((1 - dto.price / (dto.originalPrice as number)) * 100)
    : undefined;

  return {
    id: dto.id,
    name: dto.name,
    tagline: dto.tagline ?? "",
    price: dto.isTrial ? "0" : formatAmount(dto.price),
    ...(hasOffer
      ? { originalPrice: formatAmount(dto.originalPrice as number) }
      : {}),
    ...(discountPercentage ? { discountPercentage } : {}),
    ...(discountPercentage
      ? { offerCountdown: offerCountdown(dto.offerEndsAt) }
      : {}),
    period: periodLabel(dto.duration, dto.customDurationDays),
    cta: dto.ctaLabel?.trim() || `Start with ${dto.name}`,
    featured: dto.isFeatured,
    comingSoon: dto.isComingSoon,
    features: dto.features.length > 0 ? dto.features : fallbackFeatures(dto),
  };
}

/**
 * Loads the catalogue for the landing page. Called from a server component so
 * the pricing ships in the SSR HTML — a marketing page's prices have to be
 * crawlable, not painted in after hydration.
 *
 * Revalidated rather than fetched per request: plans change rarely, and the
 * landing page must not fall over because the API is briefly unreachable.
 */
export async function fetchLandingPlans(): Promise<Plan[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/public/plans`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: PublicPlanDto[] };
    return (payload.data ?? []).map(toPlan);
  } catch {
    // Never let a pricing fetch take the whole marketing page down.
    return [];
  }
}
