import type { BusinessVertical } from '@/lib/business-verticals';
import type { Plan } from '../types';

type CatalogLimitField = 'maxProducts' | 'maxMenuItems' | 'maxServices';

const VERTICAL_CATALOG_FIELD: Record<BusinessVertical, CatalogLimitField> = {
  ECOMMERCE: 'maxProducts',
  RESTAURANT: 'maxMenuItems',
  MARKETING_AGENCY: 'maxServices',
};

const CATALOG_LABEL: Record<CatalogLimitField, string> = {
  maxProducts: 'products',
  maxMenuItems: 'menu items',
  maxServices: 'services',
};

/** Client mirror of the server's resolveCatalogLimit (plan-limits.util.ts) — the one catalogue cap that applies to a tenant. */
export function resolveCatalogLimit(plan: Plan, tenantVertical: BusinessVertical): { label: string; value: number | null } {
  const field = VERTICAL_CATALOG_FIELD[tenantVertical];
  return { label: CATALOG_LABEL[field], value: plan[field] };
}

/** Is this plan offerable to a tenant of this vertical? Null businessVertical = universal. */
export function planAppliesToVertical(plan: Pick<Plan, 'businessVertical'>, tenantVertical: BusinessVertical): boolean {
  return plan.businessVertical === null || plan.businessVertical === tenantVertical;
}
