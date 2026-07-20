'use client';
import { useQuery } from '@tanstack/react-query';
import { getAnalyticsOverview } from '../services/analyticsService';
import type { CustomRange, RangePreset } from '../types';

export function useAnalyticsOverview(range: RangePreset, custom?: CustomRange) {
  const isCustom = !!custom?.from && !!custom?.to;
  return useQuery({
    queryKey: [
      'analytics',
      'overview',
      isCustom
        ? { from: custom!.from!.toISOString(), to: custom!.to!.toISOString() }
        : { range },
    ],
    queryFn: () => getAnalyticsOverview({ range, custom: isCustom ? custom : undefined }),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
