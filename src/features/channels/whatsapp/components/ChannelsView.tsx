"use client";
import { OrderApiCard } from "@/features/channels/apiKey/components/OrderApiCard";
import { WhatsAppCard } from "./WhatsAppCard";

export function ChannelsView() {
  return (
    <div className="max-w-5xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
          Channels
        </h1>
        <p className="mt-0.5 text-[13.5px] text-[var(--ink-mute)]">
          Choose a channel to connect or configure.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <WhatsAppCard />
        <OrderApiCard />
      </div>
    </div>
  );
}
