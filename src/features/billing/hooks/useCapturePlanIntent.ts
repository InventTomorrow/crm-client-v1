"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { savePlanIntent } from "../utils/planIntent";

/**
 * Catches `?plan=<id>` on the auth pages.
 *
 * The marketing site sends visitors to /auth/register?plan=… when they pick a
 * plan while signed out. Parking it here means the choice survives email
 * verification and the whole onboarding run — by the time it can be redeemed
 * the query string is long gone.
 */
export function useCapturePlanIntent(): void {
  const params = useSearchParams();

  useEffect(() => {
    const planId = params.get("plan");
    if (planId) savePlanIntent(planId);
  }, [params]);
}
