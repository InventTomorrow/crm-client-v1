// Single source of truth lives in the vertical registry — re-exported here so
// existing `@/features/tenant/types` imports keep working.
export type { BusinessVertical } from '@/lib/business-verticals';

import type { BusinessVertical } from '@/lib/business-verticals';

export interface Tenant {
  id: string;
  name: string;
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

export interface CreateTenantPayload {
  name: string;
  businessVertical: BusinessVertical;
}
