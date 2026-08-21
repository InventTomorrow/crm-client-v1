import { z } from 'zod';

export type RangePreset = '3d' | '7d' | '30d' | '90d';

export interface CustomRange {
  from?: Date;
  to?: Date;
}

/** Every rendered number goes through this — a missing or null count falls back
 * to 0 instead of throwing at `.toLocaleString()` during render. */
const countSchema = z.number().catch(0);

export const kpiCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: countSchema,
  delta: z.number().nullable().catch(null),
  up: z.boolean().catch(false),
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
  leads: countSchema,
  orders: countSchema,
  completedOrders: countSchema,
  appointments: countSchema,
  completedAppointments: countSchema,
});

export const analyticsChartSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  metrics: z.array(dailyMetricSchema),
});

export const funnelStageSchema = z.object({
  label: z.string(),
  value: countSchema,
});

export const aiHandoffSchema = z.object({
  handled: countSchema,
  escalated: countSchema,
  resolved: countSchema,
  resolutionRate: countSchema,
});

export const analyticsOverviewSchema = z.object({
  window: z.object({ from: z.string(), to: z.string() }),
  kpis: z.array(kpiCardSchema).catch([]),
  chart: analyticsChartSchema,
  series: z.array(dailyPointSchema).catch([]),
  funnel: z.array(funnelStageSchema).catch([]),
  aiHandoff: aiHandoffSchema.catch({ handled: 0, escalated: 0, resolved: 0, resolutionRate: 0 }),
  /** All-time booked revenue — unaffected by the selected range. */
  lifetimeRevenue: countSchema,
});

export type KpiCard = z.infer<typeof kpiCardSchema>;
export type DailyMetric = z.infer<typeof dailyMetricSchema>;
export type DailyPoint = z.infer<typeof dailyPointSchema>;
export type AnalyticsChart = z.infer<typeof analyticsChartSchema>;
export type FunnelStage = z.infer<typeof funnelStageSchema>;
export type AiHandoff = z.infer<typeof aiHandoffSchema>;
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;
