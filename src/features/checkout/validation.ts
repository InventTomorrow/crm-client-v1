import { z } from "zod";

export const checkoutFormSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(5, "Phone is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address is required"),
  city: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
