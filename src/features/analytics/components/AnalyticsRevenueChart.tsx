"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/Chart";
import { useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { AnalyticsOverview } from "../types";

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

type AnalyticsRevenueChartProps = {
  chart: AnalyticsOverview["chart"];
  series: AnalyticsOverview["series"];
  chartConfig: ChartConfig;
};

export default function AnalyticsRevenueChart({
  chart,
  series,
  chartConfig,
}: AnalyticsRevenueChartProps) {
  const gradientPrefix = useId();
  const gradientId = (metric: string) => `${gradientPrefix}-${metric}`;

  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          {chart.metrics.map((metric) => (
            <linearGradient
              key={metric}
              id={gradientId(metric)}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor={`var(--color-${metric})`}
                stopOpacity={0.32}
              />
              <stop
                offset="95%"
                stopColor={`var(--color-${metric})`}
                stopOpacity={0.02}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
            <ChartTooltipContent labelFormatter={(l) => fmtDay(String(l))} />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.metrics.map((metric) => (
          <Area
            key={metric}
            dataKey={metric}
            type="monotone"
            stroke={`var(--color-${metric})`}
            strokeWidth={2}
            fill={`url(#${gradientId(metric)})`}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
