// Single source of truth lives in the vertical registry — re-exported here so
// existing `@/features/tenant/types` imports keep working.
export type { BusinessVertical } from '@/lib/business-verticals';

import { BUSINESS_VERTICAL_VALUES, type BusinessVertical } from '@/lib/business-verticals';
import { z } from 'zod';

// Mirrors server tenant.dto.ts createTenantSchema limits.
export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, 'Workspace name must be at least 2 characters').max(60),
  businessName: z.string().trim().min(2, 'Business name must be at least 2 characters').max(120),
  businessVertical: z.enum(BUSINESS_VERTICAL_VALUES, { error: 'Pick a business type' }),
  replaceTenantId: z.string().optional(),
});
export type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>;

export interface Tenant {
  id: string;
  /** Internal workspace label — fixed at creation, never editable. */
  name: string;
  /** Customer-facing trading name, editable from Business settings. Null on workspaces created before the split. */
  businessName?: string | null;
  type: 'INDIVIDUAL' | 'ORGANIZATION';
  status: 'ACTIVE' | 'SUSPENDED' | 'CHURNED';
  businessVertical: BusinessVertical;
  /** Set when the workspace is soft-deleted; purged 60 days later. */
  deletedAt?: string | null;
  createdAt: string;
  _count?: {
    memberships: number;
  };
}

export interface TenantWithMembership extends Tenant {
  role: { id: string; name: string };
  isActive?: boolean;
}

/**
 * Headline counters for one workspace the signed-in user belongs to. `revenue`
 * is only meaningful for order verticals, `appointments` only for booking ones —
 * the card picks by capability.
 */
export interface WorkspaceStats {
  tenantId: string;
  businessVertical: BusinessVertical;
  leads: number;
  members: number;
  appointments: number;
  revenue: number;
}

export interface CreateTenantPayload {
  name: string;
  businessName: string;
  businessVertical: BusinessVertical;
  /** At the workspace cap: this workspace is scheduled for deletion (60-day grace) to free the slot. */
  replaceTenantId?: string;
}
