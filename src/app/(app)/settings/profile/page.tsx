import { ProfileSection } from "@/features/settings/components/ProfileSection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your name, contact details, and avatar",
};

export default function ProfileSettingsPage() {
  return (
    <SettingsSectionShell>
      <ProfileSection />
    </SettingsSectionShell>
  );
}
