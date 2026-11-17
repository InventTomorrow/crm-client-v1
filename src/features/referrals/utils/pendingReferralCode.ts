import { REFERRAL_CODE_PATTERN } from "../types";

const STORAGE_KEY = "asaanrabta.pendingReferralCode";
const PENDING_CODE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface StoredReferralCode {
  code: string;
  savedAt: number;
}

// Storage can throw in private mode; a lost code only means the field starts empty.
export function savePendingReferralCode(rawCode: string): void {
  const code = rawCode.trim().toUpperCase();
  if (!REFERRAL_CODE_PATTERN.test(code)) return;
  try {
    const storedCode: StoredReferralCode = { code, savedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(storedCode));
  } catch {
    return;
  }
}

export function readPendingReferralCode(): string | null {
  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) return null;
    const storedCode = JSON.parse(rawValue) as StoredReferralCode;
    if (Date.now() - storedCode.savedAt > PENDING_CODE_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return REFERRAL_CODE_PATTERN.test(storedCode.code) ? storedCode.code : null;
  } catch {
    return null;
  }
}

export function clearPendingReferralCode(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
}
