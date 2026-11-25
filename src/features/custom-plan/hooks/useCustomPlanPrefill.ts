"use client";

import { useMe } from "@/features/auth/hooks/useAuth";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import type { CustomPlanRequestFormValues } from "../types";

/** Signed-in users should not retype what the account already knows. */
export function useCustomPlanPrefill(): Partial<CustomPlanRequestFormValues> {
  const { user } = useMe();
  const { tenant } = useCurrentTenant();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  return {
    ...(fullName ? { customerName: fullName } : {}),
    ...(user?.email ? { customerEmail: user.email } : {}),
    ...(user?.phone ? { customerPhone: user.phone } : {}),
    ...((tenant?.businessName ?? tenant?.name)
      ? { businessName: tenant.businessName ?? tenant.name }
      : {}),
  };
}
