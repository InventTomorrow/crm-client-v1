import type { Metadata } from "next";
import LegalLayout from "@/features/legal/components/LegalLayout";
import { PRIVACY_SECTIONS } from "@/features/legal/data/privacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy · AsaanRabta",
  description:
    "Learn how AsaanRabta collects, uses, and safeguards your business data, customer contacts, and WhatsApp messaging metadata in full compliance with Meta Platform Policies.",
  openGraph: {
    title: "Privacy Policy · AsaanRabta",
    description:
      "Learn how AsaanRabta collects, uses, and safeguards your business data, customer contacts, and WhatsApp messaging metadata.",
    url: "https://asaanrabta.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Transparent data privacy, Meta Graph API standards, and security safeguards for your WhatsApp CRM and customer contacts."
      badge="Privacy & Trust"
      lastUpdated="July 29, 2026"
      activeTab="privacy"
      sections={PRIVACY_SECTIONS}
    />
  );
}
