'use client';
import { create } from 'zustand';

interface TourNavigationState {
  /** Step index the tour is navigating away from, or null when it is settled. */
  navigatingFromStep: number | null;
  startNavigation: (stepIndex: number) => void;
  clearNavigation: () => void;
}

/**
 * Steps that change route wait for the next page's target to mount, which can
 * take a moment on a cold query. Recording which step we left lets the card show
 * a loader that clears itself the instant the step index moves on.
 */
export const useTourNavigationStore = create<TourNavigationState>((set) => ({
  navigatingFromStep: null,
  startNavigation: (stepIndex) => set({ navigatingFromStep: stepIndex }),
  clearNavigation: () => set({ navigatingFromStep: null }),
}));
