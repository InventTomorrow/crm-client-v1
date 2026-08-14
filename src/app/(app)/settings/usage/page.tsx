import { UsageView } from "@/features/billing/components/UsageView";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Usage",
  description: "Track your plan limits and monthly message usage",
};

export default function UsageSettingsPage() {
  return (
    <SettingsSectionShell>
      <Suspense fallback={null}>
        <UsageView />
      </Suspense>
    </SettingsSectionShell>
  );
}
