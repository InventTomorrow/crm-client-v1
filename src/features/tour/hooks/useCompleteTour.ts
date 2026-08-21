'use client';
import type { UserResponse } from '@/features/auth/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { TourId } from '../constants';
import { completeTour } from '../services/tourService';

/**
 * Marks a tour as seen. Optimistic: the local `me` cache is updated first so the
 * tour never re-triggers while the request is in flight. Failures stay silent —
 * a missed write only means the guide offers itself again next session.
 */
export function useCompleteTour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tourId: TourId) => completeTour(tourId),
    onMutate: (tourId) => {
      const previousUser = queryClient.getQueryData<UserResponse>(['me']);
      if (previousUser && !previousUser.completedTours?.includes(tourId)) {
        queryClient.setQueryData<UserResponse>(['me'], {
          ...previousUser,
          completedTours: [...(previousUser.completedTours ?? []), tourId],
        });
      }
      return { previousUser };
    },
    onError: (_error, _tourId, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['me'], context.previousUser);
      }
    },
    onSuccess: ({ completedTours }) => {
      const currentUser = queryClient.getQueryData<UserResponse>(['me']);
      if (currentUser) {
        queryClient.setQueryData<UserResponse>(['me'], { ...currentUser, completedTours });
      }
    },
  });
}
