import { TeamSection } from "@/features/settings/components/TeamSection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Control",
  description: "Manage team members, roles, and permissions",
};

export default function AccessSettingsPage() {
  return (
    <SettingsSectionShell>
      <TeamSection />
    </SettingsSectionShell>
  );
}
