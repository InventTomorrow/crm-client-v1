import type { Metadata } from "next";
import LegalLayout from "@/features/legal/components/LegalLayout";
import { DELETION_SECTIONS } from "@/features/legal/data/deletionContent";

export const metadata: Metadata = {
  title: "User Data Deletion Instructions · AsaanRabta",
  description:
    "Step-by-step instructions for deleting your account, personal data, and Facebook/Meta app permissions from AsaanRabta in compliance with Meta policy.",
  openGraph: {
    title: "User Data Deletion Instructions · AsaanRabta",
    description:
      "Step-by-step instructions for deleting your account, personal data, and Facebook/Meta app permissions from AsaanRabta.",
    url: "https://asaanrabta.com/data-deletion",
  },
};

export default function DataDeletionPage() {
  return (
    <LegalLayout
      title="User Data Deletion Instructions"
      subtitle="Complete guide for requesting data erasure, revoking Meta Facebook app authorizations, and purging CRM workspace records."
      badge="Meta & GDPR Compliance"
      lastUpdated="July 29, 2026"
      activeTab="deletion"
      sections={DELETION_SECTIONS}
    />
  );
}
