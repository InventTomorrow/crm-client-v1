import { z } from "zod";
import { pkPhoneSchema } from "@/features/checkout/validation";
import { PAYMENT_METHODS } from "./types";

/**
 * Mirrors the server's submitSubscriptionSchema
 * (server/src/modules/subscriptions/public-subscription.dto.ts).
 * Keep the two in sync — the API re-validates everything here.
 */
const baseSchema = z.object({
  /** 2–80 characters */
  customerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer"),

  /** Required, well-formed email, max 254 chars (RFC 5321) */
  customerEmail: z
    .string()
    .trim()
    .min(1, "Email is required")
    .max(254, "Email is too long")
    .email("Enter a valid email address"),

  /** Pakistani mobile or landline — shared validator with checkout/validation */
  customerPhone: pkPhoneSchema,

  /** Optional — if entered: 2–120 chars, letters / digits / spaces / common punctuation */
  businessName: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || v.length >= 2,
      "Business name must be at least 2 characters",
    )
    .refine(
      (v) => v.length <= 120,
      "Business name must be 120 characters or fewer",
    )
    .optional()
    .or(z.literal("")),

  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Select how you paid" }),

  /** Coerced number; must be ≥ 0 */
  paymentAmount: z.coerce
    .number({ message: "Enter the amount you paid" })
    .min(0, "Amount cannot be negative")
    .max(10_000_000, "Amount seems too large — please check"),

  /** Set by the receipt uploader once the file lands. Required only for paid
   *  plans — see subscriptionCheckoutSchema below. */
  receiptUrl: z.string().optional().or(z.literal("")),
});

/**
 * A free/trial plan has nothing to pay for, so demanding a receipt would make
 * the form impossible to submit. The server applies the same rule against the
 * plan's real price, so this can't be bypassed by editing the client.
 */
export function subscriptionCheckoutSchema(requiresPayment: boolean) {
  if (!requiresPayment) return baseSchema;
  return baseSchema
    .refine((v) => Boolean(v.receiptUrl), {
      path: ["receiptUrl"],
      message: "Upload your payment receipt",
    })
    .refine((v) => Number(v.paymentAmount) > 0, {
      path: ["paymentAmount"],
      message: "Enter the amount you paid",
    });
}

export type SubscriptionCheckoutFormData = z.infer<typeof baseSchema>;
export type SubscriptionCheckoutFormInput = z.input<typeof baseSchema>;

