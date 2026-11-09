import { SeedPanel } from "@/features/seed/components/SeedPanel";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Data",
  description: "Seed sample records into this workspace for testing",
};

export default function TestDataSettingsPage() {
  return (
    <SettingsSectionShell>
      <SeedPanel />
    </SettingsSectionShell>
  );
}
