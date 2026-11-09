'use client';
import { useQuery } from '@tanstack/react-query';
import { getUpcomingFollowUps } from '../services/followUpsService';

export function useUpcomingFollowUps() {
  return useQuery({
    queryKey: ['follow-ups', 'upcoming'],
    queryFn: getUpcomingFollowUps,
  });
}
