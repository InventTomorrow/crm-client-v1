"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { useWAConfig } from "../hooks/useWhatsApp";
import { ASSISTANT_SETTINGS_ANCHOR } from "./AISettingsWidget";

// Entry point only — the assistant toggles themselves live in
// Settings → Chatbot (AISettingsWidget).
export function AssistantSettingsCard() {
  const { data: config } = useWAConfig();
  const aiEnabled = config?.aiEnabled ?? false;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <Zap size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-[var(--ink)]">
              Assistant Settings
            </p>
            <p className="text-[11.5px] text-[var(--ink-mute)]">
              AI auto-reply behavior
            </p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
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

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-[12px] leading-snug text-[var(--ink-mute)]">
          Control AI auto-reply, after-hours replies, and order cancellation
          from Settings.
        </p>
        <Button asChild variant="outline" size="sm" className="shrink-0">
          <Link href={`/settings?section=chatbot#${ASSISTANT_SETTINGS_ANCHOR}`}>
            Manage <ArrowRight size={14} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
