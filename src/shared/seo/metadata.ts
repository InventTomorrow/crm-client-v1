import type { Metadata } from "next";
import { SITE_LOCALE, SITE_NAME, absoluteUrl } from "@/shared/lib/site";

export const PRIVATE_PAGE_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
};

export const PUBLIC_PAGE_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export interface PageMetadataInput {
  title: string;
  description: string;
  /** Canonical route, e.g. "/privacy-policy". */
  path: string;
  /** Indexable page. Defaults to false — private CRM surface. */
  isPublic?: boolean;
  ogType?: "website" | "article";
  keywords?: string[];
  /** ISO date → article:modified_time (only emitted for ogType "article"). */
  modifiedTime?: string;
}

// OG/Twitter images are intentionally not set here: the file conventions
// (src/app/opengraph-image.png, src/app/twitter-image.png) auto-inject them
// and take priority over config-based images.
export function buildPageMetadata({
  title,
  description,
  path,
  isPublic = false,
  ogType = "website",
  keywords,
  modifiedTime,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical },
    robots: isPublic ? PUBLIC_PAGE_ROBOTS : PRIVATE_PAGE_ROBOTS,
    openGraph: {
      type: ogType,
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      ...(ogType === "article" && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
