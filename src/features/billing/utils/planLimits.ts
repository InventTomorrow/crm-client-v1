import type { BusinessVertical } from '@/lib/business-verticals';
import type { Plan } from '../types';

type CatalogLimitField =
  | 'maxProducts'
  | 'maxMenuItems'
  | 'maxServices'
  | 'maxClinicalServices';

const VERTICAL_CATALOG_FIELD: Record<BusinessVertical, CatalogLimitField> = {
  ECOMMERCE: 'maxProducts',
  RESTAURANT: 'maxMenuItems',
  MARKETING_AGENCY: 'maxServices',
  HEALTHCARE: 'maxClinicalServices',
};

const CATALOG_LABEL: Record<CatalogLimitField, string> = {
  maxProducts: 'products',
  maxMenuItems: 'menu items',
  maxServices: 'services',
  maxClinicalServices: 'clinical services',
};

/**
 * "No cap" sentinel, mirroring the server's UNLIMITED_LIMIT
 * (server/src/modules/plans/plan-limits.util.ts). Any plan limit or usage
 * metric can carry it, so nothing renders a max* value without going through
 * formatPlanLimit — a raw one would print "-1" on the pricing page.
 */
export const UNLIMITED_LIMIT = -1;

export function isUnlimitedLimit(limit: number | null | undefined): boolean {
  return limit === UNLIMITED_LIMIT;
}

/** A plan limit as a customer reads it. */
export function formatPlanLimit(limit: number): string {
  return isUnlimitedLimit(limit) ? 'Unlimited' : limit.toLocaleString('en-PK');
}

/** Client mirror of the server's resolveCatalogLimit (plan-limits.util.ts) — the one catalogue cap that applies to a tenant. */
export function resolveCatalogLimit(plan: Plan, tenantVertical: BusinessVertical): { label: string; value: number | null } {
  const field = VERTICAL_CATALOG_FIELD[tenantVertical];
  return { label: CATALOG_LABEL[field], value: plan[field] };
}

/** Is this plan offerable to a tenant of this vertical? Null businessVertical = universal. */
export function planAppliesToVertical(plan: Pick<Plan, 'businessVertical'>, tenantVertical: BusinessVertical): boolean {
  return plan.businessVertical === null || plan.businessVertical === tenantVertical;
}
