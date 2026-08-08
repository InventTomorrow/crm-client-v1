import { z } from "zod";
import { PAYMENT_METHODS } from "./types";

/**
 * Mirrors the server's submitSubscriptionSchema
 * (server/src/modules/subscriptions/public-subscription.dto.ts).
 * Keep the two in sync — the API re-validates everything here.
 */
const baseSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required"),
  customerEmail: z.string().trim().email("Enter a valid email"),
  customerPhone: z
    .string()
    .trim()
    .min(5, "Phone is required")
    .max(30, "Phone is too long"),
  businessName: z.string().trim().max(120).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS, { message: "Select how you paid" }),
  paymentReference: z.string().trim().max(120).optional().or(z.literal("")),
  paymentAmount: z.coerce
    .number({ message: "Enter the amount you paid" })
    .min(0, "Amount cannot be negative"),
  // Set by the receipt uploader once the file lands. Required only for paid
  // plans — see subscriptionCheckoutSchema below.
  receiptUrl: z.string().optional().or(z.literal("")),
  customerNote: z.string().trim().max(500).optional().or(z.literal("")),
});

/**
 * A free/trial plan has nothing to pay for, so demanding a receipt would make
 * the form impossible to submit. The server applies the same rule against the
 * plan's real price, so this can't be bypassed by editing the client.
 */
export function subscriptionCheckoutSchema(requiresPayment: boolean) {
  if (!requiresPayment) return baseSchema;
  return baseSchema.refine((v) => Boolean(v.receiptUrl), {
    path: ["receiptUrl"],
    message: "Upload your payment receipt",
  });
}

export type SubscriptionCheckoutFormData = z.infer<typeof baseSchema>;
export type SubscriptionCheckoutFormInput = z.input<typeof baseSchema>;
