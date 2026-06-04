import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { broadcastService } from '../services/broadcastService';
import type { CreateBroadcastPayload } from '../types';

export const useCreateBroadcast = () => {
  return useMutation({
    mutationFn: (payload: CreateBroadcastPayload) => broadcastService.create(payload),
    onSuccess: () => {
      toast.success('Broadcast started successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to start broadcast';
      toast.error(msg);
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
