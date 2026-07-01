"use client";
import { cn } from "@/lib/utils";
import { Switch } from "@/shared/ui/Switch";
import { Ban, MessageSquareReply, Zap } from "lucide-react";
import { useUpdateWAConfig, useWAConfig } from "../hooks/useWhatsApp";

function ToggleRow({
  Icon,
  iconClassName,
  title,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  Icon: typeof Zap;
  iconClassName: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-3">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
            iconClassName,
          )}
        >
          <Icon size={15} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[var(--ink)]">{title}</p>
          <p className="mt-px text-[12px] leading-snug text-[var(--ink-mute)]">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

export function AISettingsWidget() {
  const { data: config, isLoading } = useWAConfig();
  const updateConfigMut = useUpdateWAConfig();

  const aiEnabled = config?.aiEnabled ?? false;

  return (
    <div className="card flex h-full flex-col overflow-hidden p-4">
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
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <Zap size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[var(--ink)]">
            AI Assistant
          </p>
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            Handles replies across all channels
          </p>
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-4 flex flex-col gap-2.5">
        <ToggleRow
          Icon={MessageSquareReply}
          iconClassName="bg-[var(--accent-soft)] text-[var(--accent)]"
          title="Auto-Reply"
          description={
            config?.autoReply
              ? "AI replies to leads automatically"
              : "AI drafts replies for you to review"
          }
          checked={config?.autoReply ?? false}
          onCheckedChange={(v) => updateConfigMut.mutate({ autoReply: v })}
          disabled={isLoading || updateConfigMut.isPending}
        />
        <ToggleRow
          Icon={Ban}
          iconClassName="bg-[rgba(239,68,68,0.08)] text-[#EF4444]"
          title="Cancel Orders via Chat"
          description={
            config?.allowOrderCancellation
              ? "Customers can cancel pending orders in chat"
              : "Cancellations are routed to support"
          }
          checked={config?.allowOrderCancellation ?? true}
          onCheckedChange={(v) =>
            updateConfigMut.mutate({ allowOrderCancellation: v })
          }
          disabled={isLoading || updateConfigMut.isPending}
        />
      </div>

      {/* Status footnote */}
      <div className="mt-auto pt-3">
        {aiEnabled ? (
          <p className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[11.5px] text-[#15803D]">
            AI is enabled — responding to lead messages.
          </p>
        ) : (
          <p className="rounded-lg border border-[#FDE68A] bg-[#FEF9C3] px-3 py-2 text-[11.5px] text-[#854D0E]">
            AI is paused — enable the chatbot in Settings to start auto-replying.
          </p>
        )}
      </div>
    </div>
  );
}
