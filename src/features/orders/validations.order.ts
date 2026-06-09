import { z } from "zod";

export const orderItemFormSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  quantity: z.coerce.number().int().min(1, "Min 1"),
  unitPrice: z.coerce.number().nonnegative("Must be ≥ 0"),
});
export type OrderItemFormValues = z.infer<typeof orderItemFormSchema>;

export const orderFormSchema = z.object({
  leadId: z.string().min(1, "Select a customer/lead"),
  conversationId: z.string().optional(),
  currency: z.string().optional().default("PKR"),
  discount: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional(),
  items: z.array(orderItemFormSchema).min(1, "Add at least one item"),
});
export type OrderFormValues = z.infer<typeof orderFormSchema>;
