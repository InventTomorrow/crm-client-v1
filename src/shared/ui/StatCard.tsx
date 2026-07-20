"use client";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Compact metric card used in page headers (leads, orders, inventory).
 * Hover lifts the card, tints the border/icon and sweeps an accent bar — the
 * shared look for every stat across the app. Pass `onClick` to make it a
 * toggle (e.g. filter by status); `active` shows the selected state.
 */
export function StatCard({
  label,
  value,
  hint,
  Icon,
  active = false,
  accent,
  onClick,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  Icon?: LucideIcon;
  active?: boolean;
  /** Optional dot/icon color (defaults to the accent token). */
  accent?: string;
  onClick?: () => void;
  className?: string;
}) {
  const interactive = !!onClick;
  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cn(
        "card group relative flex items-center gap-3 overflow-hidden p-3.5 transition-colors duration-200",
        "hover:bg-[var(--surface-2)]",
        interactive &&
          "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]",
        active && "border-[var(--accent)] bg-[var(--accent-soft)]",
        className,
      )}
    >
      {Icon && (
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--surface-2)] text-[var(--ink-mute)] transition-colors group-hover:bg-[var(--accent-soft)] group-hover:text-[var(--accent)]"
          style={accent ? { color: accent } : undefined}
        >
          <Icon size={16} />
        </span>
      )}
      <div className="min-w-0">
        <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
          {label}
        </div>
        <div className="mt-0.5 truncate text-[19px] font-semibold leading-tight text-[var(--ink)]">
          {value}
        </div>
        {hint && (
          <div className="mt-0.5 truncate text-[10.5px] text-[var(--ink-mute)]">
            {hint}
          </div>
        )}
      </div>
    </div>
  );
}
