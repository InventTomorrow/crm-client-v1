import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import { SystemSection } from "@/features/settings/components/SystemSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status",
  description: "Platform health and system statistics",
};

export default function SystemSettingsPage() {
  return (
    <SettingsSectionShell>
      <SystemSection />
    </SettingsSectionShell>
  );
}
