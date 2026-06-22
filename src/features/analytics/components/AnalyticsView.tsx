"use client";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/Chart";
import {
  CheckCircle2,
  Flame,
  RefreshCw,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  XAxis,
  YAxis,
} from "recharts";
import { useAnalyticsOverview } from "../hooks/useAnalyticsOverview";
import type { AiHandoff, FunnelStage, KpiCard, RangePreset } from "../types";

const PRESETS: RangePreset[] = ["3d", "7d", "30d", "90d"];

const chartConfig = {
  leads: { label: "Leads", color: "var(--accent)" },
  orders: { label: "Orders", color: "var(--accent-2)" },
  completed: { label: "Completed", color: "#7C3AED" },
} satisfies ChartConfig;

const KPI_ICONS: Record<string, LucideIcon> = {
  newLeads: UserPlus,
  hotLeads: Flame,
  closed: CheckCircle2,
  orders: ShoppingBag,
  revenue: Wallet,
  aiResolution: Zap,
};

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

function formatDelta(delta: number | null) {
  if (delta === null) return "—";
  const pct = Math.round(delta * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

// ──────────────────── Funnel Chart ────────────────────
function FunnelChart({ data }: { data: FunnelStage[] }) {
  const max = data[0]?.value || 1;
  return (
    <div className="flex flex-col gap-2">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-[110px] text-[12px] font-medium text-[var(--ink-soft)]">
              {d.label}
            </div>
            <div className="flex-1 h-[26px] rounded-md overflow-hidden relative bg-[var(--surface-2)] border border-[var(--line)]">
              <div
                className="h-full flex items-center justify-end pr-2.5 text-[11px] font-medium text-white transition-all bg-[var(--accent)]"
                style={{ width: `${pct}%` }}
              >
                {d.value.toLocaleString()}
              </div>
            </div>
            <div className="w-12 text-[11px] text-right text-[var(--ink-mute)] font-[var(--font-mono)]">
              {Math.round(pct)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────── KPI Card ────────────────────
function KpiTile({ kpi }: { kpi: KpiCard }) {
  const value =
    kpi.key === "revenue"
      ? kpi.value.toLocaleString()
      : kpi.key === "aiResolution"
        ? `${kpi.value}%`
        : kpi.value.toLocaleString();
  const Trend = kpi.up ? TrendingUp : TrendingDown;
  const Icon = KPI_ICONS[kpi.key] ?? Zap;
  return (
    <div className="card kpi group relative overflow-hidden p-4 transition-shadow hover:shadow-md">
      <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[var(--accent-soft)] opacity-60 transition-transform group-hover:scale-110" />
      <div className="relative flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
          <Icon size={17} />
        </span>
        {kpi.delta !== null && (
          <span
            className={cn(
              "badge font-medium inline-flex items-center gap-1",
              kpi.up
                ? "bg-[rgba(34,197,94,0.12)] text-[#15803D]"
                : "bg-[rgba(239,68,68,0.12)] text-[#DC2626]",
            )}
          >
            <Trend size={11} /> {formatDelta(kpi.delta)}
          </span>
        )}
      </div>
      <div className="relative mt-3 font-semibold leading-none text-[28px] text-[var(--ink)] font-[var(--font-head)]">
        {value}
      </div>
      <div className="relative mt-1.5 text-[12px] text-[var(--ink-mute)]">
        {kpi.label}
      </div>
    </div>
  );
}

// ──────────────────── AI Handoff ────────────────────
function AiHandoffCard({ data }: { data: AiHandoff }) {
  const cells = [
    { label: "Handled by AI", value: data.handled },
    { label: "Escalated", value: data.escalated },
    { label: "Resolved", value: data.resolved },
  ];
  return (
    <div className="card p-[18px]">
      <h3 className="text-[14px] font-semibold mb-1">AI Handoff</h3>
      <div className="text-[12px] mb-3.5 text-[var(--ink-mute)]">
        Resolution rate {Math.round(data.resolutionRate * 100)}%
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cells.map((c, i) => (
          <div
            key={i}
            className="rounded-md bg-[var(--surface-2)] border border-[var(--line)] p-3"
          >
            <div className="font-semibold text-[22px] text-[var(--ink)] font-[var(--font-head)] leading-none">
              {c.value.toLocaleString()}
            </div>
            <div className="text-[11px] mt-1.5 text-[var(--ink-mute)]">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────── Loading Skeleton ────────────────────
function Bar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--line)] dark:bg-white/10',
        className,
      )}
    />
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-3.5">
      {/* KPI cards */}
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card kpi p-4">
            <div className="flex items-start justify-between">
              <Bar className="h-9 w-9 rounded-lg" />
              <Bar className="h-4 w-12" />
            </div>
            <Bar className="mt-4 h-7 w-2/3" />
            <Bar className="mt-2.5 h-3 w-1/2" />
          </div>
        ))}
      </div>

      {/* Chart card */}
      <div className="card p-[18px]">
        <Bar className="h-4 w-40" />
        <Bar className="mt-2 h-3 w-56" />
        <div className="mt-4 h-[240px] animate-pulse">
          <svg
            viewBox="0 0 600 240"
            preserveAspectRatio="none"
            className="h-full w-full text-[var(--line)] dark:text-white/10"
          >
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                x2="600"
                y1={20 + i * 66}
                y2={20 + i * 66}
                stroke="currentColor"
                strokeWidth="1.5"
              />
            ))}
            <path
              d="M0,180 C80,150 120,90 200,110 C280,130 320,60 400,80 C480,100 540,40 600,55"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Funnel + AI handoff */}
      <div className="grid gap-3.5 grid-cols-[2fr_1fr] max-lg:grid-cols-1">
        <div className="card p-[18px]">
          <Bar className="h-4 w-32" />
          <div className="mt-4 flex flex-col gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bar key={i} className="h-[26px]" />
            ))}
          </div>
        </div>
        <div className="card p-[18px]">
          <Bar className="h-4 w-28" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-[68px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────── AnalyticsView (root) ────────────────────
export function AnalyticsView() {
  const [range, setRange] = useState<RangePreset>("30d");

  const { data, isLoading, isFetching, refetch, dataUpdatedAt } =
    useAnalyticsOverview(range);

  const onPreset = (r: RangePreset) => setRange(r);

  return (
    <div className="scroll overflow-y-auto h-full p-[18px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 gap-3 flex-wrap">
        <div>
          <h2 className="text-[20px] font-semibold">Analytics</h2>
          <div className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
            {dataUpdatedAt
              ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString()} · auto-refreshes`
              : "Loading…"}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="seg">
            {PRESETS.map((r) => (
              <button
                key={r}
                className={range === r ? "on" : ""}
                onClick={() => onPreset(r)}
              >
                {r}
              </button>
            ))}
          </div>
          {/* Custom date range selector paused for now */}
          <button
            className="btn btn-outline"
            onClick={() => refetch()}
            disabled={isFetching}
            aria-label="Refresh"
          >
            <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {isLoading || !data ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid gap-3 mb-4 grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
            {data.kpis.map((k) => (
              <KpiTile key={k.key} kpi={k} />
            ))}
          </div>

          {/* The one graph: Leads vs Orders */}
          <div className="card mb-3.5 p-[18px]">
            <div className="mb-2.5">
              <h3 className="text-[14px] font-semibold">Leads vs Orders</h3>
              <div className="text-[12px] text-[var(--ink-mute)]">
                New leads and paid orders per day
              </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <RLineChart
                data={data.series}
                margin={{ left: 4, right: 12, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDay}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  allowDecimals={false}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(l) => fmtDay(String(l))}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="leads"
                  type="monotone"
                  stroke="var(--color-leads)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="orders"
                  type="monotone"
                  stroke="var(--color-orders)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="completed"
                  type="monotone"
                  stroke="var(--color-completed)"
                  strokeWidth={2}
                  dot={false}
                />
              </RLineChart>
            </ChartContainer>
          </div>

          {/* Funnel + AI Handoff */}
          <div className="grid gap-3.5 grid-cols-[2fr_1fr] max-lg:grid-cols-1">
            <div className="card p-[18px]">
              <div className="mb-3.5">
                <h3 className="text-[14px] font-semibold">Lead Funnel</h3>
                <div className="text-[12px] text-[var(--ink-mute)]">
                  Conversion stages
                </div>
              </div>
              <FunnelChart data={data.funnel} />
            </div>
            <AiHandoffCard data={data.aiHandoff} />
          </div>
        </>
      )}
    </div>
  );
}
