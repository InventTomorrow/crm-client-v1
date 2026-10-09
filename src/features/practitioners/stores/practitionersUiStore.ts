"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PractitionersView = "grid" | "list";

interface PractitionersUiState {
  view: PractitionersView;
  setView: (view: PractitionersView) => void;
}

/** Listing-screen view choice, persisted across reloads; the search lives in the URL. */
export const usePractitionersUiStore = create<PractitionersUiState>()(
  persist(
    (set) => ({
      view: "grid",
      setView: (view) => set({ view }),
    }),
    { name: "sf:practitioners-ui" },
  ),
);
