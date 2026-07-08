'use client';
import { create } from 'zustand';

// Safety auto-clear: the server emits a "stopped" event on flush, but if it is
// missed we still drop the indicator after this long without a fresh keystroke.
const LEAD_TYPING_TTL_MS = 8_000;

interface TypingState {
  /** Conversation whose lead is currently typing, or null. */
  typingConversationId: string | null;
  setTyping: (conversationId: string | null) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingConversationId: null,
  setTyping: (conversationId) => set({ typingConversationId: conversationId }),
}));

let clearTimer: ReturnType<typeof setTimeout> | null = null;

/** Folds a `typing` SSE event into the store (called by useAppEvents). */
export function applyTypingEvent(event: {
  conversationId?: string;
  isTyping?: boolean;
}): void {
  if (!event.conversationId) return;
  const { typingConversationId, setTyping } = useTypingStore.getState();

  if (event.isTyping) {
    if (clearTimer) clearTimeout(clearTimer);
    setTyping(event.conversationId);
    clearTimer = setTimeout(() => setTyping(null), LEAD_TYPING_TTL_MS);
  } else if (typingConversationId === event.conversationId) {
    if (clearTimer) clearTimeout(clearTimer);
    setTyping(null);
  }
}
