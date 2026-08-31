import { z } from "zod";

/**
 * One clinical intake question, owned by the workspace rather than by a service.
 *
 * `key` is the storage key the assistant files the answer under and the value a
 * service holds in its `intakeFieldKeys`. It is derived server-side from the
 * question text at creation and never changes, so it is never edited here.
 *
 * Mirrors the `IntakeQuestion` model on the server.
 */
export interface IntakeQuestion {
  id: string;
  tenantId: string;
  key: string;
  questionText: string;
  /** Asked on every enquiry. Otherwise asked only by services that opt in. */
  askAlways: boolean;
  /** Seeded from the shipped defaults — a label only, not a restriction. */
  isBuiltIn: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** The services still asking a question, shown before it is deleted. */
export interface IntakeQuestionUsage {
  id: string;
  name: string;
}

export const intakeQuestionFormSchema = z.object({
  questionText: z
    .string()
    .trim()
    .min(1, "Write the question the assistant should ask")
    .max(300, "Keep it under 300 characters"),
  askAlways: z.boolean(),
});

export type IntakeQuestionFormData = z.infer<typeof intakeQuestionFormSchema>;
