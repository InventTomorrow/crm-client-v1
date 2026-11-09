export interface ThreadMessage {
  id: string;
  aiIntentTag?: string | null;
  isDraft: boolean;
}

export const isFollowUpMessage = (message: ThreadMessage): boolean =>
  message.aiIntentTag === 'FOLLOW_UP';

// Any ordinary message (a business reply or the customer's) starts a new cycle, so numbering restarts after it.
export function numberFollowUpMessages(messages: readonly ThreadMessage[]): Map<string, number> {
  const followUpNumbers = new Map<string, number>();
  let followUpsInCycle = 0;
  for (const message of messages) {
    if (message.isDraft) continue;
    if (!isFollowUpMessage(message)) {
      followUpsInCycle = 0;
      continue;
    }
    followUpsInCycle += 1;
    followUpNumbers.set(message.id, followUpsInCycle);
  }
  return followUpNumbers;
}

// The max comes from today's settings; never show "3/2" if it was lowered after sending.
export function formatFollowUpLabel(followUpNumber: number, maxAttempts: number | undefined): string {
  if (maxAttempts === undefined) return `Follow-up ${followUpNumber}`;
  return `Follow-up ${followUpNumber}/${Math.max(followUpNumber, maxAttempts)}`;
}
