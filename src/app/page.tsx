import { LandingPage } from "@/features/landing/components/LandingPage";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AsaanRabta — Turn WhatsApp Into Your 24/7 Sales Assistant",
  description:
    "Reply faster, manage every lead, send broadcasts, and convert more customers — all from one simple WhatsApp sales platform built for WhatsApp-first businesses.",
};

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
      <LandingPage />
    </div>
  );
}
