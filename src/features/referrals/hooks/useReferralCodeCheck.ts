"use client";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { checkReferralCode } from "../services/referralService";
import { REFERRAL_CODE_PATTERN } from "../types";

const CHECK_DEBOUNCE_MS = 450;

export type ReferralCodeCheckState =
  | { status: "empty" }
  | { status: "malformed" }
  | { status: "checking" }
  | { status: "valid"; code: string; discountPercent: number }
  | { status: "invalid"; message: string };

function errorMessageOf(error: unknown): string {
  if (isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? "We couldn't check this code. Try again.";
  }
  return "We couldn't check this code. Try again.";
}

/** Debounced server check so the customer sees the discount before submitting. */
export function useReferralCodeCheck(rawCode: string): ReferralCodeCheckState {
  const code = rawCode.trim().toUpperCase();
  const debouncedCode = useDebouncedValue(code, CHECK_DEBOUNCE_MS);
  const isWellFormed = REFERRAL_CODE_PATTERN.test(debouncedCode);

  const codeCheckQuery = useQuery({
    queryKey: ["referral-code-check", debouncedCode],
    queryFn: () => checkReferralCode(debouncedCode),
    enabled: isWellFormed,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (!code) return { status: "empty" };
  if (!REFERRAL_CODE_PATTERN.test(code)) return { status: "malformed" };
  if (code !== debouncedCode || codeCheckQuery.isFetching) return { status: "checking" };
  if (codeCheckQuery.isError) {
    return { status: "invalid", message: errorMessageOf(codeCheckQuery.error) };
  }
  if (codeCheckQuery.data) {
    return {
      status: "valid",
      code: codeCheckQuery.data.code,
      discountPercent: codeCheckQuery.data.discountPercent,
    };
  }
  return { status: "checking" };
}
