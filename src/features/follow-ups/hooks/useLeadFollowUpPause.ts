'use client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useLead } from '@/features/leads/hooks/useLeads';
import type { Lead } from '@/features/leads/types';
import { extractErrorMessage } from '@/lib/utils';
import { setLeadFollowUpPause } from '../services/followUpsService';
import { useFollowUpSettings } from './useFollowUpSettings';

const leadDetailKey = (leadId: string) => ['leads', 'detail', leadId] as const;

export function useSetLeadFollowUpPause(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isPaused: boolean) => setLeadFollowUpPause(leadId, isPaused),
    onMutate: async (isPaused) => {
      await queryClient.cancelQueries({ queryKey: leadDetailKey(leadId) });
      const previousLead = queryClient.getQueryData<Lead>(leadDetailKey(leadId));
      queryClient.setQueryData<Lead>(leadDetailKey(leadId), (currentLead) =>
        currentLead
          ? {
              ...currentLead,
              followUpsPausedAt: isPaused ? new Date().toISOString() : undefined,
              followUpsPausedBy: isPaused ? 'AGENT' : undefined,
            }
          : currentLead,
      );
      return { previousLead };
    },
    onSuccess: (_pause, isPaused) =>
      toast.success(isPaused ? 'Follow-ups paused for this lead' : 'Follow-ups turned back on'),
    onError: (error, _isPaused, context) => {
      if (context?.previousLead) queryClient.setQueryData(leadDetailKey(leadId), context.previousLead);
      toast.error(extractErrorMessage(error, 'Failed to update follow-ups'));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: leadDetailKey(leadId) }),
  });
}

export function useLeadFollowUpPauseToggle(leadId: string) {
  const { data: settingsView } = useFollowUpSettings();
  const { data: lead } = useLead(leadId);
  const { mutate: setPaused, isPending } = useSetLeadFollowUpPause(leadId);
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState(false);

  const isPaused = !!lead?.followUpsPausedAt;
  const isPausedByCustomer = lead?.followUpsPausedBy === 'CUSTOMER';

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
    isVisible: !!lead && !!settingsView?.isAvailable && settingsView.settings.enabled,
    isPaused,
    isPausedByCustomer,
    pausedAt: lead?.followUpsPausedAt,
    isPending,
    isResumeConfirmOpen,
    toggleFollowUps,
    confirmResume,
    cancelResume: () => setIsResumeConfirmOpen(false),
  };
}
