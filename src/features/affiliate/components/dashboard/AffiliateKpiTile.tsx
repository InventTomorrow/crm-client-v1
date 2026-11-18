import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

interface AffiliateKpiTileProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Percent change vs the previous period; null hides the pill. */
  change: number | null;
  hint?: string;
}

export function AffiliateKpiTile({ label, value, icon: Icon, change, hint }: AffiliateKpiTileProps) {
  const TrendIcon = change !== null && change < 0 ? TrendingDown : TrendingUp;
  return (
    <div className="card kpi group relative overflow-hidden p-4 transition-shadow hover:shadow-md">
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--accent-soft)] opacity-60 transition-transform group-hover:scale-110" />
      <div className="relative flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon size={17} />
        </span>
        {change !== null && (
          <span
            className={cn(
              "badge inline-flex items-center gap-1 font-medium",
              change >= 0
                ? "bg-success-soft text-success-foreground"
                : "bg-destructive/10 text-destructive",
            )}
          >
            <TrendIcon size={11} /> {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div className="relative mt-3 text-[26px] font-semibold leading-none text-[var(--ink)] font-[var(--font-head)]">
        {value}
      </div>
      <div className="relative mt-1.5 text-[12px] text-[var(--ink-mute)]">{label}</div>
      {hint && <div className="relative mt-1 text-[11px] text-[var(--ink-mute)]">{hint}</div>}
    </div>
  );
}
