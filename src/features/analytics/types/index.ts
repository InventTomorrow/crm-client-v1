import { z } from 'zod';

export type RangePreset = '3d' | '7d' | '30d' | '90d';

export interface CustomRange {
  from?: Date;
  to?: Date;
}

export const kpiCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  delta: z.number().nullable(),
  up: z.boolean(),
  lowerIsBetter: z.boolean().default(false),
});

/** Mirrors the server's DailyMetric — which of these the graph plots is decided
 * per vertical and sent back in `chart.metrics`. */
export const dailyMetricSchema = z.enum([
  'leads',
  'orders',
  'completedOrders',
  'appointments',
  'completedAppointments',
]);

export const dailyPointSchema = z.object({
  date: z.string(),
  leads: z.number(),
  orders: z.number(),
  completedOrders: z.number(),
  appointments: z.number(),
  completedAppointments: z.number(),
});

export const analyticsChartSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  metrics: z.array(dailyMetricSchema),
});

export const funnelStageSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const aiHandoffSchema = z.object({
  handled: z.number(),
  escalated: z.number(),
  resolved: z.number(),
  resolutionRate: z.number(),
});

export const analyticsOverviewSchema = z.object({
  window: z.object({ from: z.string(), to: z.string() }),
  kpis: z.array(kpiCardSchema),
  chart: analyticsChartSchema,
  series: z.array(dailyPointSchema),
  funnel: z.array(funnelStageSchema),
  aiHandoff: aiHandoffSchema,
});

export type KpiCard = z.infer<typeof kpiCardSchema>;
export type DailyMetric = z.infer<typeof dailyMetricSchema>;
export type DailyPoint = z.infer<typeof dailyPointSchema>;
export type AnalyticsChart = z.infer<typeof analyticsChartSchema>;
export type FunnelStage = z.infer<typeof funnelStageSchema>;
export type AiHandoff = z.infer<typeof aiHandoffSchema>;
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;
