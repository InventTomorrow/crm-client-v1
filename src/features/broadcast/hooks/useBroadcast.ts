import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { broadcastService } from '../services/broadcastService';
import type { CreateBroadcastPayload } from '../types';

export const useCreateBroadcast = () => {
  return useMutation({
    mutationFn: (payload: CreateBroadcastPayload) => broadcastService.create(payload),
    onSuccess: () => {
      toast.success('Broadcast started successfully');
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, 'Failed to start broadcast'));
    },
  });
};

export const useBroadcastProgress = (id?: string) => {
  return useQuery({
    queryKey: ['broadcast', id],
    queryFn: () => broadcastService.getById(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'DONE' || data.status === 'FAILED')) {
        return false;
      }
      return 2000;
    },
  });
};
