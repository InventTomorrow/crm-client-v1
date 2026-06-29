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
});

export const dailyPointSchema = z.object({
  date: z.string(),
  leads: z.number(),
  orders: z.number(),
  completed: z.number(),
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
  series: z.array(dailyPointSchema),
  funnel: z.array(funnelStageSchema),
  aiHandoff: aiHandoffSchema,
});

export type KpiCard = z.infer<typeof kpiCardSchema>;
export type DailyPoint = z.infer<typeof dailyPointSchema>;
export type FunnelStage = z.infer<typeof funnelStageSchema>;
export type AiHandoff = z.infer<typeof aiHandoffSchema>;
export type AnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;
