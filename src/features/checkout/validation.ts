import { z } from "zod";

/**
 * Validates a Pakistani phone number (mobile or landline).
 *
 * Accepted formats (spaces, dashes, dots, and parentheses are stripped):
 *   Local mobile  : 03xx-xxxxxxx   → 11 digits starting with 03
 *   Intl (+92)    : +923xx-xxxxxxx → 12 digits after +
 *   Intl (0092)   : 00923xxxxxxxxx
 *   Landline (0xx): 0xx-xxxxxxx    → area code + 7 digits  (e.g. 042-1234567)
 *
 * Valid mobile network prefixes (PTA-assigned as of 2024):
 *   030x, 031x → Jazz / Mobilink
 *   032x       → Zong
 *   033x       → Ufone
 *   034x, 035x → Telenor
 *   036x, 037x → SCOM / SCO (Gilgit-Baltistan)
 *   038x       → WiTribe / fixed-wireless (niche, included for completeness)
 */
const PK_MOBILE_RE = /^(?:(?:\+|00)92|0)3[0-9]{9}$/; // 03xx + 8 digits (local)
const PK_LANDLINE_RE = /^0[2-9][0-9]{7,8}$/; // 0xx-xxxxxxx / 0xxx-xxxxxxx

function normalizePKPhone(raw: string): string {
  return raw.replace(/[\s\-.()+]/g, "");
}

function isValidPKPhone(raw: string): boolean {
  const n = normalizePKPhone(raw);
  return PK_MOBILE_RE.test(n) || PK_LANDLINE_RE.test(n);
}

export const pkPhoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidPKPhone, {
    message: "Enter a valid phone number (e.g. 0300-1234567 or +923001234567)",
  });

export const checkoutFormSchema = z.object({
  /** 2–80 characters, no leading/trailing whitespace */
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),

  /** Pakistani mobile or landline number — see pkPhoneSchema above */
  customerPhone: pkPhoneSchema,

  /** Optional — but if a value is entered it must be a well-formed email (max 254 chars) */
  email: z
    .string()
    .trim()
    .max(254, "Email is too long")
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),

  /** Street address: 5–200 characters */
  addressLine1: z
    .string()
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must be 200 characters or fewer"),

  /** Optional — but if provided: 2–100 chars, letters / spaces / hyphens only */
  city: z
    .string()
    .trim()
    .max(100, "City must be 100 characters or fewer")
    .refine(
      (v) => v === "" || /^[\p{L}\s\-']+$/u.test(v),
      "City can only contain letters, spaces, or hyphens",
    )
    .optional()
    .or(z.literal("")),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
