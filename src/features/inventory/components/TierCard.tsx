import { cn } from "@/lib/utils";
import { Check, Cloud, Link, Lock, Package, Shield } from "lucide-react";
import type { TIERS } from "../types";

const TIER_ICONS = [Package, Link, Cloud, Shield] as const;

export function TierCard({
  tier,
  active,
  onClick,
}: {
  tier: (typeof TIERS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = TIER_ICONS[tier.id - 1];
  const disabled = tier.id > 1;

  return (
    <div
      className={cn(
        "card relative flex flex-col gap-2 h-full p-[14px]",
        disabled
          ? "opacity-60 cursor-not-allowed border-[var(--line)] bg-[var(--surface-2)]"
          : active
            ? "cursor-pointer border-[var(--accent)] bg-[var(--accent-soft)]"
            : "cursor-pointer border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)]",
      )}
      onClick={disabled ? undefined : onClick}
    >
      {disabled && (
        <span className="absolute top-2 right-2">
          <Lock size={11} className="text-[var(--ink-mute)]" />
        </span>
      )}
      <div className="flex items-center justify-between">
        <div
          className={[
            "w-8 h-8 rounded-[9px] flex items-center justify-center",
            active && !disabled
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]",
          ].join(" ")}
        >
          <Icon size={15} />
        </div>
        {disabled ? (
          <span className="badge font-medium bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)] text-[10px]">
            Coming soon
          </span>
        ) : (
          <span className="badge font-medium bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)]">
            Tier {tier.id}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-[13.5px] font-medium">{tier.name}</h4>
        <div className="text-[11.5px] mt-0.5 leading-relaxed text-[var(--ink-soft)]">
          {tier.desc}
        </div>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[11px] text-[var(--ink-mute)]">{tier.count}</span>
        {active && !disabled && (
          <Check size={13} className="text-[var(--accent)]" />
        )}
      </div>
    </div>
  );
}
