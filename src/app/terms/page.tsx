import type { Metadata } from "next";
import LegalLayout from "@/features/legal/components/LegalLayout";
import { TERMS_SECTIONS } from "@/features/legal/data/termsContent";

export const metadata: Metadata = {
  title: "Terms of Service · AsaanRabta",
  description:
    "Read the Terms of Service governing the use of AsaanRabta WhatsApp CRM, AI agents, multi-inbox capabilities, and connection policies.",
  openGraph: {
    title: "Terms of Service · AsaanRabta",
    description:
      "Read the Terms of Service governing the use of AsaanRabta WhatsApp CRM, AI agents, multi-inbox capabilities, and connection policies.",
    url: "https://asaanrabta.com/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Terms and conditions governing your subscription, platform access, AI agent usage, and WhatsApp connection protocols."
      badge="Legal Agreement"
      lastUpdated="July 29, 2026"
      sections={TERMS_SECTIONS}
    />
  );
}
