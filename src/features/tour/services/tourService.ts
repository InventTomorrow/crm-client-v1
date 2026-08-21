import { apiClient } from '@/lib/apiClient';
import type { TourId } from '../constants';
import type { CompleteTourResponse } from '../types';

export async function completeTour(tourId: TourId): Promise<CompleteTourResponse> {
  const res = await apiClient.post<{ success: true; data: CompleteTourResponse }>(
    '/auth/me/tours/complete',
    { tourId },
  );
  return res.data.data;
}
