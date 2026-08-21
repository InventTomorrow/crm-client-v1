import { apiClient } from '@/lib/apiClient';
import { analyticsOverviewSchema, type AnalyticsOverview, type CustomRange, type RangePreset } from '../types';

export interface OverviewParams {
  range: RangePreset;
  custom?: CustomRange;
}

export async function getAnalyticsOverview({ range, custom }: OverviewParams) {
  const params =
    custom?.from && custom?.to
      ? { from: custom.from.toISOString(), to: custom.to.toISOString() }
      : { range };
  const res = await apiClient.get<{ success: true; data: AnalyticsOverview }>(
    '/analytics/overview',
    { params },
  );
  // Parsed, not cast — an older API build missing a numeric field would crash the render.
  return analyticsOverviewSchema.parse(res.data.data);
}
