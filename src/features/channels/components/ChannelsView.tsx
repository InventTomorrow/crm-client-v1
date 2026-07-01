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

      {/* Channel connectivity + AI assistant — independent concerns, side by side */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2">
        <WhatsAppWidget />
        <AISettingsWidget />
      </div>
    </div>
  );
}
