import { z } from "zod";
import { PAYMENT_METHODS } from "./types";

/**
 * Mirrors the server's submitSubscriptionSchema
 * (server/src/modules/subscriptions/public-subscription.dto.ts).
 * Keep the two in sync — the API re-validates everything here.
 */
export const subscriptionCheckoutSchema = z.object({
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
  // Set by the receipt uploader once the file lands — required, so the admin
  // always has proof of payment to review.
  receiptUrl: z.string().min(1, "Upload your payment receipt"),
  customerNote: z.string().trim().max(500).optional().or(z.literal("")),
});

export type SubscriptionCheckoutFormData = z.infer<
  typeof subscriptionCheckoutSchema
>;
export type SubscriptionCheckoutFormInput = z.input<
  typeof subscriptionCheckoutSchema
>;
