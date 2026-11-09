'use client';
import { useQuery } from '@tanstack/react-query';
import { getFollowUpAnalytics } from '../services/followUpsService';
import type { FollowUpAnalyticsRange } from '../types';

export function useFollowUpReplyRates(range: FollowUpAnalyticsRange) {
  return useQuery({
    queryKey: ['follow-ups', 'analytics', range],
    queryFn: () => getFollowUpAnalytics(range),
  });
}
