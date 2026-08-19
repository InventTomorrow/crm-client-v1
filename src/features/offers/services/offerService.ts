import { apiClient } from "@/lib/apiClient";
import { activeOfferSchema, type ActiveOffer } from "../types";

/** A campaign that ended between publish and read parses fine but is null. */
const offerResponseSchema = activeOfferSchema.nullable();

/** In-app read — goes through the shared axios client. */
export async function getActiveOffer(): Promise<ActiveOffer | null> {
  const response = await apiClient.get<{ success: true; data: unknown }>("/public/promo-offer");
  const parsed = offerResponseSchema.safeParse(response.data.data);
  return parsed.success ? parsed.data : null;
}

/**
 * Server-component twin for the marketing site, so the banner and its
 * countdown ship in the SSR HTML instead of popping in after hydration.
 * Revalidates faster than the plan catalogue — a campaign that just started
 * should not wait five minutes to show up.
 */
export async function fetchActiveOffer(): Promise<ActiveOffer | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/public/promo-offer`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: unknown };
    const parsed = offerResponseSchema.safeParse(payload.data ?? null);
    return parsed.success ? parsed.data : null;
  } catch {
    // Never let a promo fetch take the whole marketing page down.
    return null;
  }
}
