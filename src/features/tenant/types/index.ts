export interface Tenant {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'ORGANIZATION';
  status: 'ACTIVE' | 'SUSPENDED' | 'CHURNED';
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
}
