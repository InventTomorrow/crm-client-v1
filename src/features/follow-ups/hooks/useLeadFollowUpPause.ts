'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { getLeadFollowUpStatus, sendFollowUpNow, setLeadFollowUpPause } from '../services/followUpsService';
import type { LeadFollowUpStatus } from '../types';

const leadFollowUpStatusKey = (leadId: string) => ['follow-ups', 'lead', leadId] as const;
const QUEUED_POLL_MS = 2_000;

export function useLeadFollowUpStatus(leadId: string | null | undefined) {
  return useQuery({
    queryKey: leadFollowUpStatusKey(leadId ?? ''),
    queryFn: () => getLeadFollowUpStatus(leadId!),
    enabled: !!leadId,
    // While a "Follow up now" waits in the queue, check back until it is sent or fails.
    refetchInterval: (query) => (query.state.data?.manualFollowUp?.state === 'QUEUED' ? QUEUED_POLL_MS : false),
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

export function useSendFollowUpNow(leadId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sendFollowUpNow(leadId),
    onError: (error) => toast.error(extractErrorMessage(error, 'Could not queue the follow-up')),
    // The server now reports "queued", which is what turns on the polling.
    onSettled: () => queryClient.invalidateQueries({ queryKey: leadFollowUpStatusKey(leadId) }),
  });
}

export function useLeadFollowUpPauseToggle(leadId: string) {
  const queryClient = useQueryClient();
  const { data: status } = useLeadFollowUpStatus(leadId);
  const { mutate: setPaused, isPending } = useSetLeadFollowUpPause(leadId);
  const { mutate: sendNow, isPending: isQueuing } = useSendFollowUpNow(leadId);
  const [isResumeConfirmOpen, setIsResumeConfirmOpen] = useState(false);
  // Only an outcome this session asked for is announced, never a stale one from an earlier visit.
  const isAwaitingOutcome = useRef(false);
  const announcedAt = useRef<string | null>(null);

  const isPaused = !!status?.followUpsPausedAt;
  const isPausedByCustomer = status?.followUpsPausedBy === 'CUSTOMER';
  const manualFollowUp = status?.manualFollowUp ?? null;

  useEffect(() => {
    if (!manualFollowUp || manualFollowUp.state === 'QUEUED') return;
    if (!isAwaitingOutcome.current || announcedAt.current === manualFollowUp.at) return;

    announcedAt.current = manualFollowUp.at;
    isAwaitingOutcome.current = false;
    if (manualFollowUp.state === 'SENT') {
      toast.success('Follow-up sent on WhatsApp');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    } else {
      toast.error(manualFollowUp.message);
    }
  }, [manualFollowUp, queryClient]);

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

  const followUpNow = () => {
    isAwaitingOutcome.current = true;
    sendNow(undefined, {
      onSuccess: () => toast.success('Follow-up queued'),
      onError: () => {
        isAwaitingOutcome.current = false;
      },
    });
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
    manualFollowUp,
    isQueuing,
    followUpNow,
  };
}
