import { z } from 'zod';

export const RESOURCE_TYPES = [
  'BROCHURE',
  'PORTFOLIO',
  'CASE_STUDY',
  'PRICE_LIST',
  'OTHER',
] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  BROCHURE: 'Brochure',
  PORTFOLIO: 'Portfolio',
  CASE_STUDY: 'Case study',
  PRICE_LIST: 'Price list',
  OTHER: 'Other',
};

/**
 * Match conditions keyed by qualification field name — AND across keys, OR
 * within a key. An empty object means the resource is always eligible.
 */
export const resourceConditionsSchema = z.record(
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
);
export type ResourceConditions = z.infer<typeof resourceConditionsSchema>;

/** Mirrors `MAX_RESOURCE_FILE_SIZE_BYTES` on the server. */
export const MAX_RESOURCE_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Mirrors `createResourceSchema` on the server. */
export const resourceFormSchema = z.object({
  label: z.string().min(1, 'Give this file a name'),
  description: z.string().nullable().optional(),
  resourceType: z.enum(RESOURCE_TYPES),
  fileUrl: z.string().min(1, 'Upload a file first'),
  // Images and PDFs — mirrors the server, which rejects anything else.
  mimeType: z
    .string()
    .min(1)
    .refine((mimeType) => /^(image\/[\w.+-]+|application\/pdf)$/i.test(mimeType), {
      message: 'Only image or PDF files are supported',
    }),
  sizeBytes: z
    .number()
    .int()
    .min(0)
    .max(MAX_RESOURCE_FILE_SIZE_BYTES, 'File must be 10 MB or smaller'),
  conditions: resourceConditionsSchema,
  isActive: z.boolean(),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;
export type ResourceFormInput = z.input<typeof resourceFormSchema>;

export interface TenantResource {
  id: string;
  tenantId: string;
  label: string;
  description: string | null;
  resourceType: ResourceType;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  conditions: ResourceConditions | null;
  isActive: boolean;
  createdAt: string;
}

export interface ResourceFilters {
  resourceType?: ResourceType;
  isActive?: boolean;
  search?: string;
}
