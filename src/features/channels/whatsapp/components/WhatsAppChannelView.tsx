"use client";
import { ChannelBreadcrumb } from "@/features/channels/components/ChannelBreadcrumb";
import { cn } from "@/lib/utils";
import { useUnifiedWAStatus } from "../hooks/useWhatsApp";
import { AISettingsWidget } from "./AISettingsWidget";
import { MetaConnectWidget } from "./MetaConnectWidget";
import { WhatsAppWidget } from "./WhatsAppWidget";

/** Dims a provider card while the other provider holds the connection. */
function ProviderSlot({
  disabled,
  disabledHint,
  children,
}: {
  disabled: boolean;
  disabledHint: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", disabled && "select-none")}>
      <div className={cn(disabled && "pointer-events-none opacity-45")}>
        {children}
      </div>
      {disabled && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center">
          <span className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-[11px] font-medium text-[var(--ink-mute)] shadow-sm">
            {disabledHint}
          </span>
        </div>
      )}
    </div>
  );
}

export function WhatsAppChannelView() {
  const { data: unifiedStatus } = useUnifiedWAStatus();

  // One provider at a time: while one holds the connection (or is mid-pairing),
  // the other card is dimmed. The server enforces this too (409 on connect).
  const activeProvider =
    unifiedStatus?.status !== "DISCONNECTED"
      ? (unifiedStatus?.provider ?? null)
      : null;

  return (
    <div className="max-w-5xl space-y-6 p-4 md:p-8">
      <ChannelBreadcrumb current="WhatsApp" />
      <div>
        <h1 className="text-[22px] font-semibold font-[var(--font-head)]">
          WhatsApp
        </h1>
        <p className="mt-0.5 text-[13.5px] text-[var(--ink-mute)]">
          Connect one way — scan a QR code with your phone, or use Meta&apos;s
          official Business API. Then configure the AI assistant that replies
          to customers.
        </p>
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
        <ProviderSlot
          disabled={activeProvider === "META"}
          disabledHint="Disconnect the Meta API connection to use QR pairing"
        >
          <WhatsAppWidget />
        </ProviderSlot>
        <ProviderSlot
          disabled={activeProvider === "BAILEYS"}
          disabledHint="Disconnect the QR session to use the Meta API"
        >
          <MetaConnectWidget />
        </ProviderSlot>
      </div>

      <div className="flex max-w-md flex-col gap-4">
        <AISettingsWidget />
      </div>
    </div>
  );
}
