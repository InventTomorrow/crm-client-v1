"use client";
import { create } from "zustand";

interface PractitionerDraftState {
  /** The row step one created, while the wizard is still filling it in. */
  draftId: string | null;
  /** Which step to resume on once that row's edit route takes over. */
  stepIndex: number;
  setDraft: (draftId: string, stepIndex: number) => void;
  reset: () => void;
}

const NO_DRAFT = { draftId: null, stepIndex: 0 } as const;

/**
 * The hand-off between "Add practitioner" and the record it creates.
 *
 * Step one writes a real row and the wizard then continues on that row's edit
 * route, which remounts the form — this carries the position across that
 * client-side navigation. Nothing else lives here: the practitioner itself is always
 * read back from the server, and the position is ignored unless `draftId`
 * matches the record being opened, which is what makes "Add practitioner" start clean.
 *
 * Deliberately not persisted. A reload should land on a saved record at step
 * one, not resume from storage — and an in-memory store reads the same on the
 * server as on the client, so the form can seed its step during render.
 */
export const usePractitionerDraftStore = create<PractitionerDraftState>()((set) => ({
  ...NO_DRAFT,
  setDraft: (draftId, stepIndex) => set({ draftId, stepIndex }),
  reset: () => set({ ...NO_DRAFT }),
}));
