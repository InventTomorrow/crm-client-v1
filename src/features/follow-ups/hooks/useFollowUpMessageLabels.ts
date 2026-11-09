'use client';
import { useMemo } from 'react';
import {
  formatFollowUpLabel,
  isFollowUpMessage,
  numberFollowUpMessages,
  type ThreadMessage,
} from '../utils/followUpNumbering';
import { useLeadFollowUpStatus } from './useLeadFollowUpPause';

/** Message id → "Follow-up 1/2". The status request only runs when the thread holds a follow-up. */
export function useFollowUpMessageLabels(
  leadId: string | null,
  messages: readonly ThreadMessage[],
): Map<string, string> {
  const hasFollowUps = messages.some(isFollowUpMessage);
  const { data: status } = useLeadFollowUpStatus(hasFollowUps ? leadId : null);
  const maxAttempts = status?.maxAttempts;

  return useMemo(() => {
    const labels = new Map<string, string>();
    for (const [messageId, followUpNumber] of numberFollowUpMessages(messages)) {
      labels.set(messageId, formatFollowUpLabel(followUpNumber, maxAttempts));
    }
    return labels;
  }, [messages, maxAttempts]);
}
