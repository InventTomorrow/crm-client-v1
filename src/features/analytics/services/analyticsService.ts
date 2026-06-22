import { apiClient } from '@/lib/apiClient';
import type { AnalyticsOverview, CustomRange, RangePreset } from '../types';

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
  return res.data.data;
}
