// Single source of truth for the public origin. Every canonical URL, sitemap
// entry, OG tag, and JSON-LD @id resolves through here so preview deploys never
// emit production URLs.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://asaanrabta.com"
).replace(/\/+$/, "");

export const SITE_NAME = "AsaanRabta";

export const SITE_TAGLINE = "Turn WhatsApp Into Your 24/7 Sales Assistant";

export const SITE_DESCRIPTION =
  "WhatsApp CRM in Pakistan with AI that responds to customers instantly. Reply faster, manage leads, send broadcasts, and grow sales. Fast setup, Urdu & English support.";

export const SITE_LOCALE = "en_US";

export const SUPPORT_EMAIL = "support@asaanrabta.com";

// Public social profiles — feed JSON-LD `sameAs` and any footer social icons.
// Add full profile URLs here as they go live (e.g. "https://www.facebook.com/asaanrabta").
export const SOCIAL_LINKS: string[] = [];

// Resolves a route path against SITE_URL. Accepts "/leads" or "leads".
export function absoluteUrl(path = "/"): string {
  return new URL(
    path.startsWith("/") ? path : `/${path}`,
    `${SITE_URL}/`,
  ).toString();
}
