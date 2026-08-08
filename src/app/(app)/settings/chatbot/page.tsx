import { ChatbotSection } from "@/features/settings/components/ChatbotSection";
import { SettingsSectionShell } from "@/features/settings/components/SettingsSectionShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chatbot",
  description: "Configure your AI assistant's messages and personality",
};

export default function ChatbotSettingsPage() {
  return (
    <SettingsSectionShell>
      <ChatbotSection />
    </SettingsSectionShell>
  );
}
