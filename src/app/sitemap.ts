import {
  LEGAL_LAST_UPDATED_ISO,
  LEGAL_ROUTES,
} from "@/features/legal/constants";
import { SITE_URL, absoluteUrl } from "@/shared/lib/site";
import type { MetadataRoute } from "next";

// Only the indexable surface belongs here: the landing page + legal docs.
// Auth, onboarding, and all (app) CRM routes are noindexed and robots-disallowed.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...LEGAL_ROUTES.map((legalRoute) => ({
      url: absoluteUrl(legalRoute.path),
      lastModified: new Date(LEGAL_LAST_UPDATED_ISO),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
