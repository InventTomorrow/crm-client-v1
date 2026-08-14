import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/shared/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    short_name: SITE_NAME,
    description:
      "WhatsApp CRM with AI replies, shared inbox, broadcasts, and lead management.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16A572",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      { src: "/asaanrabta-icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/asaanrabta-icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
