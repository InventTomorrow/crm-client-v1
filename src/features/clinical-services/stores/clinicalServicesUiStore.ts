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
  setView: (view: ClinicalServicesView) => void;
}

/** Listing-screen view choice, persisted across reloads; search and type filters live in the URL. */
export const useClinicalServicesUiStore = create<ClinicalServicesUiState>()(
  persist(
    (set) => ({
      view: "grid",
      setView: (view) => set({ view }),
    }),
    { name: "sf:clinical-services-ui" },
  ),
);
