"use client";
import { AISettingsWidget } from "./AISettingsWidget";
import { WhatsAppWidget } from "./WhatsAppWidget";

export function ChannelsView() {
  return (
    <div className="max-w-3xl space-y-6 p-4 md:p-8">
      {/* Page heading */}
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
          Channels
        </h1>
        <p className="mt-0.5 text-[13.5px] text-[var(--ink-mute)]">
          Connect your messaging channels and configure the AI assistant.
        </p>
      </div>

      {/* Channel connectivity, then the AI assistant below it — single column */}
      <div className="flex max-w-md flex-col gap-4">
        <WhatsAppWidget />
        <AISettingsWidget />
      </div>
    </div>
  );
}
