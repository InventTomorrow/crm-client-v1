import { AssistantPolicySection } from "@/features/assistant-policy/components/AssistantPolicySection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistant rules",
  description: "When your assistant involves your team, how it handles files and appointments, and your own rules",
};

export default function AssistantRulesPage() {
  return (
    <SettingsSectionShell>
      <AssistantPolicySection />
    </SettingsSectionShell>
  );
}
