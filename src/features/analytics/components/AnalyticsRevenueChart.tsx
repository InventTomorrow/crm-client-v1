"use client";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/Chart";
import {
  CartesianGrid,
  Line,
  LineChart as RLineChart,
  XAxis,
  YAxis,
} from "recharts";
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
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <RLineChart data={series} margin={{ left: 4, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={fmtDay}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={(l) => fmtDay(String(l))} />}
        />
        <ChartLegend content={<ChartLegendContent />} />
        {chart.metrics.map((metric) => (
          <Line
            key={metric}
            dataKey={metric}
            type="monotone"
            stroke={`var(--color-${metric})`}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </RLineChart>
    </ChartContainer>
  );
}
