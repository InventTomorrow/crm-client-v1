import { z } from 'zod';

/** Why the assistant could not close the customization itself. */
export const CUSTOMIZATION_REQUEST_REASONS = [
  'CUSTOMIZATION_DISABLED',
  'OPTION_NOT_OFFERED',
  'UNRESOLVED_SPEC',
] as const;
export type CustomizationRequestReason =
  (typeof CUSTOMIZATION_REQUEST_REASONS)[number];

export const CUSTOMIZATION_REQUEST_STATUSES = [
  'NEW',
  'IN_REVIEW',
  'ANSWERED',
  'ACCEPTED',
  'DECLINED',
  'CONVERTED',
  'CLOSED',
] as const;
export type CustomizationRequestStatus =
  (typeof CUSTOMIZATION_REQUEST_STATUSES)[number];

/**
 * Statuses a reviewer may set by hand. CONVERTED is reached only by linking a
 * real order, so it is deliberately absent from the picker.
 */
export const REVIEWABLE_STATUS_OPTIONS = [
  'NEW',
  'IN_REVIEW',
  'ANSWERED',
  'ACCEPTED',
  'DECLINED',
  'CLOSED',
] as const satisfies readonly CustomizationRequestStatus[];
export type ReviewableStatus = (typeof REVIEWABLE_STATUS_OPTIONS)[number];

/** Still needs someone to act — mirrors OPEN_REQUEST_STATUSES on the server. */
export const OPEN_REQUEST_STATUSES: readonly CustomizationRequestStatus[] = [
  'NEW',
  'IN_REVIEW',
  'ANSWERED',
  'ACCEPTED',
];

/** One configured option the assistant collected before parking the request. */
export interface CollectedAnswer {
  key: string;
  label: string;
  value: string;
  imageUrl?: string;
}

export interface CustomizationRequestLeadRef {
  id: string;
  name: string | null;
  phone: string | null;
}

export interface CustomizationRequest {
  id: string;
  leadId: string;
  conversationId: string | null;
  productId: string | null;
  productName: string;
  variantLabel: string | null;
  quantity: number;
  reason: CustomizationRequestReason;
  customerNote: string;
  collectedAnswers: CollectedAnswer[] | null;
  status: CustomizationRequestStatus;
  assignedToUserId: string | null;
  reviewedByUserId: string | null;
  internalNote: string | null;
  convertedOrderId: string | null;
  reviewedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lead: CustomizationRequestLeadRef | null;
}

export interface CustomizationRequestsSummary {
  total: number;
  open: number;
  byStatus: { status: CustomizationRequestStatus; count: number }[];
}

export interface CustomizationRequestFilters {
  search?: string;
  status?: CustomizationRequestStatus;
  reason?: CustomizationRequestReason;
  assignedToUserId?: string;
  leadId?: string;
  openOnly?: boolean;
}

export const updateStatusSchema = z.object({
  status: z.enum(REVIEWABLE_STATUS_OPTIONS),
  internalNote: z.string().trim().max(2000).optional(),
});
export type UpdateStatusValues = z.infer<typeof updateStatusSchema>;

export const internalNoteSchema = z.object({
  internalNote: z
    .string()
    .trim()
    .max(2000, 'Keep the note under 2000 characters'),
});
export type InternalNoteValues = z.infer<typeof internalNoteSchema>;
