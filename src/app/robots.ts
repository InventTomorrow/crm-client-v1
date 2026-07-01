import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://asaanrabta.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/",
        "/onboarding/",
        "/inbox/",
        "/settings/",
        "/leads/",
        "/orders/",
        "/channels/",
        "/dashboard/",
        "/inventory/",
        "/admin/",
        "/notifications/",
      ], // Protect internal CRM routes from being indexed
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
