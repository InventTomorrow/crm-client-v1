"use client";
import { ChannelBreadcrumb } from "@/features/channels/components/ChannelBreadcrumb";
import { AssistantSettingsCard } from "./AssistantSettingsCard";
import { WhatsAppWidget } from "./WhatsAppWidget";

export function WhatsAppChannelView() {
  return (
    <div className="max-w-3xl space-y-6 p-4 md:p-8">
      <ChannelBreadcrumb current="WhatsApp" />
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
          WhatsApp
        </h1>
        <p className="mt-0.5 text-[13.5px] text-[var(--ink-mute)]">
          Link your number and configure the AI assistant that replies to
          customers.
        </p>
      </div>

      <div className="flex max-w-md flex-col gap-4">
        <WhatsAppWidget />
        <AssistantSettingsCard />
      </div>
    </div>
  );
}
