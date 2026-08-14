import { BusinessSection } from "@/features/settings/components/BusinessSection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business",
  description: "Manage your business profile, hours, and FAQs",
};

export default function BusinessSettingsPage() {
  return (
    <SettingsSectionShell>
      <BusinessSection />
    </SettingsSectionShell>
  );
}
