"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PractitionersView = "grid" | "list";

interface PractitionersUiState {
  view: PractitionersView;
  searchTerm: string;
  setView: (view: PractitionersView) => void;
  setSearchTerm: (searchTerm: string) => void;
  resetFilters: () => void;
}

/**
 * Listing-screen UI state only — the practitioners themselves live in TanStack
 * Query. The search survives a trip into a profile form and back; only the view
 * choice is persisted across reloads.
 */
export const usePractitionersUiStore = create<PractitionersUiState>()(
  persist(
    (set) => ({
      view: "grid",
      searchTerm: "",
      setView: (view) => set({ view }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      resetFilters: () => set({ searchTerm: "" }),
    }),
    {
      name: "sf:practitioners-ui",
      partialize: (state) => ({ view: state.view }),
    },
  ),
);
