import { z } from "zod";

/**
 * Validates a Pakistani phone number (mobile or landline).
 *
 * Accepted formats (spaces, dashes, dots, and parentheses are stripped):
 *   Local mobile   : 0300-1234567     → 03 + 9 digits
 *   Intl mobile    : +92 300 1234567  / 0092… / 92…
 *   Local landline : 042-35678901, 021-34567890, 0992-123456
 *   Intl landline  : +92 42 35678901
 *
 * Valid mobile network prefixes (PTA-assigned as of 2024):
 *   030x, 031x → Jazz / Mobilink
 *   032x       → Zong
 *   033x       → Ufone
 *   034x, 035x → Telenor
 *   036x, 037x → SCOM / SCO (Gilgit-Baltistan)
 *   038x       → WiTribe / fixed-wireless (niche, included for completeness)
 */
const PK_MOBILE_RE = /^03[0-9]{9}$/; // 03 + 9 digits = 11 total
// Area code + subscriber, 9–11 total. 03x is excluded: it is mobile-only.
const PK_LANDLINE_RE = /^0[24-9][0-9]{7,9}$/;

/**
 * Reduces every accepted form to the national number with its leading 0, so one
 * set of rules covers local and international input alike. The country code is
 * only stripped when what follows cannot itself be a national number — a
 * landline in the 092x range (Haripur) must not lose its leading digits.
 */
function toNationalPKPhone(raw: string): string {
  const digits = raw.replace(/[\s\-.()+]/g, "");
  // "0092" first: no national number has 0 as its second digit, so this can
  // only ever be the international prefix.
  if (digits.startsWith("0092")) return `0${digits.slice(4)}`;
  if (digits.startsWith("0")) return digits; // already national
  if (digits.startsWith("92")) return `0${digits.slice(2)}`;
  return `0${digits}`;
}

function isValidPKPhone(raw: string): boolean {
  const national = toNationalPKPhone(raw);
  return PK_MOBILE_RE.test(national) || PK_LANDLINE_RE.test(national);
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
