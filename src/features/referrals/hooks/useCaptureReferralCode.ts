"use client";
import { useEffect } from "react";
import { savePendingReferralCode } from "../utils/pendingReferralCode";

// Reads window.location instead of useSearchParams so host pages need no Suspense boundary.
/** Remembers a `?ref=CODE` share link so onboarding can prefill it later. */
export function useCaptureReferralCode(): void {
  useEffect(() => {
    const referralCodeParam = new URLSearchParams(window.location.search).get("ref");
    if (referralCodeParam) savePendingReferralCode(referralCodeParam);
  }, []);
}
