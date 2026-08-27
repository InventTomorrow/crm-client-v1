"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ClinicalServiceType } from "../types";

export const ALL_SERVICE_TYPES = "ALL";

export type ClinicalServicesView = "grid" | "list";
export type ClinicalServiceTypeFilter =
  | ClinicalServiceType
  | typeof ALL_SERVICE_TYPES;

interface ClinicalServicesUiState {
  view: ClinicalServicesView;
  searchTerm: string;
  typeFilter: ClinicalServiceTypeFilter;
  setView: (view: ClinicalServicesView) => void;
  setSearchTerm: (searchTerm: string) => void;
  setTypeFilter: (typeFilter: ClinicalServiceTypeFilter) => void;
  resetFilters: () => void;
}

/**
 * Listing-screen UI state only — the services themselves live in TanStack Query.
 * Filters stay in the store so stepping into a service's form and back does not
 * silently drop what the admin was looking at; only the view choice is persisted.
 */
export const useClinicalServicesUiStore = create<ClinicalServicesUiState>()(
  persist(
    (set) => ({
      view: "grid",
      searchTerm: "",
      typeFilter: ALL_SERVICE_TYPES,
      setView: (view) => set({ view }),
      setSearchTerm: (searchTerm) => set({ searchTerm }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      resetFilters: () =>
        set({ searchTerm: "", typeFilter: ALL_SERVICE_TYPES }),
    }),
    {
      name: "sf:clinical-services-ui",
      partialize: (state) => ({ view: state.view }),
    },
  ),
);
