import { z } from "zod";

export const SEED_MAX_COUNT = 10;

export const seedRecordTypeSchema = z.enum([
  "PRODUCT",
  "MENU_ITEM",
  "SERVICE_OFFERING",
  "CLINICAL_SERVICE",
  "PRACTITIONER",
  "JOB_APPLICANT",
  "APPOINTMENT",
  "APPOINTMENT_REQUEST",
  "LEAD",
  "RESOURCE",
  "CLINIC_LOCATION",
]);
export type SeedRecordType = z.infer<typeof seedRecordTypeSchema>;

export const seedCatalogEntrySchema = z.object({
  recordType: seedRecordTypeSchema,
  label: z.string(),
  description: z.string(),
  maxCount: z.number().int(),
});
export type SeedCatalogEntry = z.infer<typeof seedCatalogEntrySchema>;

export type SeedTarget = Pick<SeedCatalogEntry, "recordType" | "label">;

export const seedFormSchema = z.object({
  count: z
    .number()
    .int()
    .min(1, "Seed at least 1 record")
    .max(SEED_MAX_COUNT, `Seed at most ${SEED_MAX_COUNT} records at a time`),
});
export type SeedFormValues = z.infer<typeof seedFormSchema>;

export interface SeedRecordsResult {
  recordType: SeedRecordType;
  created: number;
}
