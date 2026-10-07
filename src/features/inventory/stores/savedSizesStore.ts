"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SavedSizesState {
  /** Keyed by workspace + category, so one workspace's sizes never show in another's. */
  sizesByScope: Record<string, string[]>;
  saveSize: (scopeKey: string, size: string) => void;
}

/** Sizes the seller typed in, kept in this browser so they stay pickable after being unticked or before any product uses them. */
export const useSavedSizesStore = create<SavedSizesState>()(
  persist(
    (set) => ({
      sizesByScope: {},
      saveSize: (scopeKey, size) =>
        set((state) => {
          const savedSizes = state.sizesByScope[scopeKey] ?? [];
          const isAlreadySaved = savedSizes.some(
            (savedSize) => savedSize.toLowerCase() === size.toLowerCase(),
          );
          if (isAlreadySaved) return state;
          return {
            sizesByScope: {
              ...state.sizesByScope,
              [scopeKey]: [...savedSizes, size],
            },
          };
        }),
    }),
    { name: "sf:inventory-saved-sizes" },
  ),
);
