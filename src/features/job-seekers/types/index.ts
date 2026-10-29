import { EMPTY_LIST_ROW } from "@/lib/validationMessages";
import { z } from "zod";

/** Mirrors `updateJobSeekerConfigSchema` on the server. */
export const MAX_JOB_SEEKER_FIELDS = 15;
export const MAX_JOB_SEEKER_INSTRUCTIONS = 20;
export const MAX_JOB_SEEKER_INSTRUCTION_LENGTH = 600;

export const jobSeekerFieldSchema = z.object({
  /** Absent on a detail added in this session — the server assigns it. */
  key: z.string().optional(),
  label: z.string().trim().min(1, "Name this detail or remove the row").max(80),
  isRequired: z.boolean(),
});

export const jobSeekerConfigSchema = z.object({
  fields: z
    .array(jobSeekerFieldSchema)
    .max(MAX_JOB_SEEKER_FIELDS)
    .refine(
      (fields) =>
        new Set(fields.map((field) => field.label.trim().toLowerCase()))
          .size === fields.length,
      "Each detail can be added only once",
    ),
  afterDetailsInstructions: z
    .array(
      z
        .string()
        .trim()
        .min(1, EMPTY_LIST_ROW)
        .max(MAX_JOB_SEEKER_INSTRUCTION_LENGTH),
    )
    .max(MAX_JOB_SEEKER_INSTRUCTIONS),
  requestCv: z.boolean(),
});

/** Mirrors `jobSeekerInputSchema` on the server. */
export const jobSeekerFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  phone: z
    .string()
    .max(30)
    .refine(
      (phone) => {
        const digitsOnly = phone.replace(/[\s\-()]/g, "");
        return digitsOnly === "" || /^\+[1-9]\d{6,14}$/.test(digitsOnly);
      },
      {
        message:
          "Use digits only, starting with + and the country code, e.g. +923001234567",
      },
    ),
  city: z.string().trim().max(80),
  details: z.record(
    z.string(),
    z.string().max(500, "Keep it under 500 characters"),
  ),
});

export type JobSeekerFormValues = z.infer<typeof jobSeekerFormSchema>;

export type JobSeekerConfigValues = z.infer<typeof jobSeekerConfigSchema>;

export interface JobSeekerConfig {
  fields: { key: string; label: string; isRequired: boolean }[];
  afterDetailsInstructions: string[];
  requestCv: boolean;
}

export interface JobSeekerCv {
  url: string;
  fileName: string | null;
  mimeType: string | null;
  receivedAt: string;
}

export interface JobSeekerDetail {
  key: string;
  label: string;
  value: string;
}

export interface JobSeeker {
  leadId: string;
  conversationId: string | null;
  name: string | null;
  phone: string | null;
  city: string | null;
  details: JobSeekerDetail[];
  cv: JobSeekerCv | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobSeekersPage {
  items: JobSeeker[];
  total: number;
  page: number;
  limit: number;
}
