import { LandingPage } from "@/features/landing/components/LandingPage";
import { LANDING_FAQ_ITEMS } from "@/features/landing/constants";
import {
  JsonLd,
  faqSchema,
  softwareApplicationSchema,
  webPageSchema,
} from "@/shared/seo/jsonLd";
import { buildPageMetadata } from "@/shared/seo/metadata";
import { Inter } from "next/font/google";
import type { CSSProperties } from "react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const HOME_TITLE = "AsaanRabta — Turn WhatsApp Into Your 24/7 Sales Assistant";
const HOME_DESCRIPTION =
  "Reply faster, manage every lead, send broadcasts, and convert more customers, all from one simple WhatsApp sales platform built for WhatsApp-first businesses.";

export const metadata = buildPageMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  isPublic: true,
  keywords: [
    "WhatsApp CRM",
    "WhatsApp CRM Pakistan",
    "WhatsApp sales automation",
    "AI WhatsApp auto reply",
    "WhatsApp broadcast",
    "lead management",
  ],
});

export default function RootPage() {
  return (
    <div
      className={inter.variable}
      style={
        {
          fontFamily: "var(--font-inter)",
          "--font-head": "var(--font-inter)",
          "--font-body": "var(--font-inter)",
        } as CSSProperties
      }
    >
      <JsonLd
        nodes={[
          webPageSchema({
            name: HOME_TITLE,
            description: HOME_DESCRIPTION,
            path: "/",
          }),
          softwareApplicationSchema(),
          faqSchema(LANDING_FAQ_ITEMS),
        ]}
      />
      <LandingPage />
    </div>
  );
}
