'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { getLeadFollowUpStatus, setLeadFollowUpPause } from '../services/followUpsService';
import type { LeadFollowUpStatus } from '../types';

const leadFollowUpStatusKey = (leadId: string) => ['follow-ups', 'lead', leadId] as const;

export function useLeadFollowUpStatus(leadId: string | null | undefined) {
  return useQuery({
    queryKey: leadFollowUpStatusKey(leadId ?? ''),
    queryFn: () => getLeadFollowUpStatus(leadId!),
    enabled: !!leadId,
  });
}

export function useSetLeadFollowUpPause(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPaused: boolean) => setLeadFollowUpPause(leadId, isPaused),
    onMutate: async (isPaused) => {
      await queryClient.cancelQueries({ queryKey: leadFollowUpStatusKey(leadId) });
      const previousStatus = queryClient.getQueryData<LeadFollowUpStatus>(leadFollowUpStatusKey(leadId));
      queryClient.setQueryData<LeadFollowUpStatus>(leadFollowUpStatusKey(leadId), (currentStatus) =>
        currentStatus
          ? {
              ...currentStatus,
              followUpsPausedAt: isPaused ? new Date().toISOString() : null,
              followUpsPausedBy: isPaused ? 'AGENT' : null,
            }
          : currentStatus,
      );
      return { previousStatus };
    },
    onSuccess: (_pause, isPaused) =>
      toast.success(isPaused ? 'Follow-ups paused for this lead' : 'Follow-ups turned back on'),
    onError: (error, _isPaused, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(leadFollowUpStatusKey(leadId), context.previousStatus);
      }
      toast.error(extractErrorMessage(error, 'Failed to update follow-ups'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: leadFollowUpStatusKey(leadId) }),
  });
}

export function useLeadFollowUpPauseToggle(leadId: string) {
  const { data: status } = useLeadFollowUpStatus(leadId);
  const { mutate: setPaused, isPending } = useSetLeadFollowUpPause(leadId);
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState(false);

  const isPaused = !!status?.followUpsPausedAt;
  const isPausedByCustomer = status?.followUpsPausedBy === 'CUSTOMER';

  // Undoing a customer's own "stop" is allowed, but never by accident.
  const toggleFollowUps = (shouldReceiveFollowUps: boolean) => {
    if (shouldReceiveFollowUps && isPausedByCustomer) {
      setIsResumeConfirmOpen(true);
      return;
    }
    setPaused(!shouldReceiveFollowUps);
  };

  const confirmResume = () => {
    setPaused(false, { onSettled: () => setIsResumeConfirmOpen(false) });
  };

  return {
    status,
    isVisible: !!status?.isEnabled,
    isPaused,
    isPausedByCustomer,
    isPending,
    isResumeConfirmOpen,
    toggleFollowUps,
    confirmResume,
    cancelResume: () => setIsResumeConfirmOpen(false),
  };
}
