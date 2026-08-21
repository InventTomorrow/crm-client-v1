'use client';
import { create } from 'zustand';

interface WelcomeDialogState {
  /** True while the post-onboarding welcome dialog owns the screen. */
  isWelcomeDialogOpen: boolean;
  setWelcomeDialogOpen: (open: boolean) => void;
}

/** Lets the dashboard tour wait its turn instead of fighting the welcome dialog for the overlay. */
export const useWelcomeDialogStore = create<WelcomeDialogState>((set) => ({
  isWelcomeDialogOpen: false,
  setWelcomeDialogOpen: (open) => set({ isWelcomeDialogOpen: open }),
}));
