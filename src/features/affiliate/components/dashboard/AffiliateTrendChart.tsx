"use client";
import { pkr } from "@/lib/utils";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/Chart";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import type { AffiliateAnalytics } from "../../types";

const chartConfig: ChartConfig = {
  signups: { label: "Sign-ups", color: "var(--info)" },
  conversions: { label: "Paid", color: "var(--accent)" },
  revenue: { label: "Revenue", color: "var(--accent-2)" },
};

function bucketLabel(bucket: string, granularity: AffiliateAnalytics["granularity"]): string {
  const bucketDate = new Date(granularity === "day" ? `${bucket}T00:00:00` : `${bucket}-01T00:00:00`);
  return bucketDate.toLocaleDateString(undefined, granularity === "day"
    ? { month: "short", day: "numeric" }
    : { month: "short", year: "2-digit" });
}

/** Revenue bars on the right axis; sign-ups and paid accounts as lines on the left. */
export default function AffiliateTrendChart({
  trend,
  granularity,
}: Pick<AffiliateAnalytics, "trend" | "granularity">) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <ComposedChart data={trend} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="bucket"
          tickFormatter={(bucket: string) => bucketLabel(bucket, granularity)}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis yAxisId="accounts" tickLine={false} axisLine={false} width={28} allowDecimals={false} />
        <YAxis
          yAxisId="revenue"
          orientation="right"
          tickLine={false}
          axisLine={false}
          width={64}
          tickFormatter={(revenue: number) => pkr(revenue)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(bucket) => bucketLabel(String(bucket), granularity)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          yAxisId="revenue"
          dataKey="revenue"
          fill="var(--color-revenue)"
          fillOpacity={0.35}
          radius={[4, 4, 0, 0]}
          maxBarSize={28}
        />
        <Line
          yAxisId="accounts"
          dataKey="signups"
          type="monotone"
          stroke="var(--color-signups)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          yAxisId="accounts"
          dataKey="conversions"
          type="monotone"
          stroke="var(--color-conversions)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
