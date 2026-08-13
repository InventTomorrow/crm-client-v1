"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import { hasCapability, type VerticalCapability } from "@/lib/business-verticals";
import { cn } from "@/lib/utils";
import { Switch } from "@/shared/ui/Switch";
import { Ban, CalendarClock, Clock, MessageSquareReply, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { useUpdateWAConfig, useWAConfig } from "../hooks/useWhatsApp";
import type { WAConfig } from "../types";

export const ASSISTANT_SETTINGS_ANCHOR = "assistant-settings";

const ASSISTANT_SETTINGS: {
  key: keyof WAConfig;
  Icon: typeof Zap;
  iconClassName: string;
  title: string;
  description: string;
  /** Only rendered when the workspace's vertical unlocks this. Omitted = always shown. */
  capability?: VerticalCapability;
}[] = [
  {
    key: "aiEnabled",
    Icon: MessageSquareReply,
    iconClassName: "bg-[var(--accent-soft)] text-[var(--accent)]",
    title: "AI Auto-Reply",
    description: "Let the AI assistant draft and send replies automatically.",
  },
  {
    key: "autoReply",
    Icon: Clock,
    iconClassName: "bg-[rgba(202,138,4,0.12)] text-[#B45309]",
    title: "Auto-Reply Outside Hours",
    description: "Send an automatic reply when your team is offline.",
  },
  {
    key: "allowOrderCancellation",
    Icon: Ban,
    iconClassName: "bg-[rgba(239,68,68,0.08)] text-[#EF4444]",
    title: "Allow Order Cancellation",
    description: "Let customers cancel their own orders via chat.",
    capability: "ORDERS",
  },
  {
    key: "allowReschedule",
    Icon: CalendarClock,
    iconClassName: "bg-[rgba(14,165,233,0.1)] text-[#0369A1]",
    title: "Allow Rescheduling",
    description: "Let customers move a booked appointment via chat.",
    capability: "BOOKINGS",
  },
];

export function AISettingsWidget() {
  const { data: config, isLoading } = useWAConfig();
  const { tenant } = useCurrentTenant();
  const { can } = usePermissions();
  const updateConfigMut = useUpdateWAConfig();
  const cardRef = useRef<HTMLDivElement>(null);

  // The toggles write the bot's behaviour, which the server gates on
  // chatbot:edit — without this a read-only role could flip a switch and
  // collect a 403 instead of the toggle it expected.
  const canEditAssistant = can("chatbot:edit");

  const visibleSettings = ASSISTANT_SETTINGS.filter(
    (setting) =>
      !setting.capability || hasCapability(tenant?.businessVertical, setting.capability),
  );

  const aiEnabled = config?.aiEnabled ?? false;

  // Deep links from the WhatsApp channel page land on #assistant-settings, but
  // the widget only mounts once the config resolves — after the browser has
  // already given up on the hash, so scroll it into view here.
  useEffect(() => {
    if (window.location.hash === `#${ASSISTANT_SETTINGS_ANCHOR}`) {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return (
    <div
      ref={cardRef}
      id={ASSISTANT_SETTINGS_ANCHOR}
      className="card flex scroll-mt-4 flex-col overflow-hidden p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-mute)]">
          Assistant
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
            aiEnabled
              ? "bg-[rgba(37,211,102,0.12)] text-[#15803D]"
              : "bg-[rgba(202,138,4,0.12)] text-[#B45309]",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              aiEnabled ? "bg-[#22C55E]" : "bg-[#CA8A04]",
            )}
          />
          {aiEnabled ? "Active" : "Paused"}
        </span>
      </div>

      {/* Identity */}
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Zap size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
            Assistant Settings
          </p>
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            Handles replies across all channels
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 flex flex-col gap-2.5">
        {visibleSettings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  setting.iconClassName,
                )}
              >
                <setting.Icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--ink)]">
                  {setting.title}
                </p>
                <p className="mt-px text-[12px] leading-snug text-[var(--ink-mute)]">
                  {setting.description}
                </p>
              </div>
            </div>
            <Switch
              checked={config?.[setting.key] ?? false}
              onCheckedChange={(checked) =>
                updateConfigMut.mutate({ [setting.key]: checked })
              }
              disabled={
                isLoading || updateConfigMut.isPending || !canEditAssistant
              }
            />
          </div>
        ))}
      </div>

      {/* Status footnote */}
      <div className="pt-3">
        {aiEnabled ? (
          <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[11.5px] text-[#15803D]">
            AI is enabled — responding to lead messages.
          </p>
        ) : (
          <p className="rounded-lg border border-[#FDE68A] bg-[#FEF9C3] px-3 py-2 text-[11.5px] text-[#854D0E]">
            AI is paused — turn on AI Auto-Reply to start answering
            automatically.
          </p>
        )}
      </div>
    </div>
  );
}
