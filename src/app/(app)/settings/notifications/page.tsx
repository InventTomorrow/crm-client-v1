import { NotificationsSection } from "@/features/settings/components/NotificationsSection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification Settings",
  description: "Choose which notifications you receive and how",
};

export default function NotificationSettingsPage() {
  return (
    <SettingsSectionShell>
      <NotificationsSection />
    </SettingsSectionShell>
  );
}
