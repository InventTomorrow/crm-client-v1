import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/shared/lib/site";

// Every private surface: auth, onboarding, tokenized flows, and all (app) CRM routes.
const PRIVATE_PATHS = [
  "/admin",
  "/api/",
  "/auth/",
  "/bookings",
  "/channels",
  "/checkout/",
  "/dashboard",
  "/demo",
  "/inbox",
  "/inventory",
  "/leads",
  "/menu",
  "/notifications",
  "/onboarding/",
  "/orders",
  "/qualification",
  "/resources",
  "/services",
  "/settings",
  "/subscribe/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: PRIVATE_PATHS,
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
