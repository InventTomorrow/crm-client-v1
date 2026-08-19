"use client";
import { cn } from "@/lib/utils";
import { useOfferCountdown } from "../hooks/useOfferCountdown";

const pad = (value: number) => String(value).padStart(2, "0");

interface OfferCountdownProps {
  endsAt: string;
  /** `inline` for banners and sidebars, `blocks` for the dialog's hero timer. */
  variant?: "inline" | "blocks";
  className?: string;
}

interface CountdownSegment {
  label: string;
  value: string;
}

/**
 * Colours come from the parent via `currentColor` — the same component sits on
 * the amber marketing banner, the app sidebar and the dialog without knowing
 * which surface it is on.
 */
export function OfferCountdown({ endsAt, variant = "inline", className }: OfferCountdownProps) {
  const remaining = useOfferCountdown(endsAt);

  // Null on the server and for the first client frame, then permanently once
  // the campaign lapses — either way there is no countdown worth showing.
  if (!remaining || remaining.hasExpired) return null;

  if (variant === "inline") {
    return (
      <span className={cn("font-mono text-[13px] font-semibold tabular-nums", className)}>
        {remaining.days > 0 && `${remaining.days}d `}
        {pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}
      </span>
    );
  }

  const segments: CountdownSegment[] = [
    { label: "Days", value: pad(remaining.days) },
    { label: "Hours", value: pad(remaining.hours) },
    { label: "Minutes", value: pad(remaining.minutes) },
    { label: "Seconds", value: pad(remaining.seconds) },
  ];

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {segments.map((segment) => (
        <div
          key={segment.label}
          className="flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl border border-current/15 bg-current/5 px-3 py-2"
        >
          <span className="font-mono text-2xl font-bold tabular-nums leading-none">
            {segment.value}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider opacity-70">
            {segment.label}
          </span>
        </div>
      ))}
    </div>
  );
}
