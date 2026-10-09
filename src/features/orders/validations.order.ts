import { z } from "zod";
import { ORDER_CREATE_STATUSES } from "./types";

const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;

const orderItemCustomOptionSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  imageUrls: z.array(z.string()).optional(),
  priceDelta: z.number(),
  requiresQuote: z.boolean(),
});

export const orderItemFormSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  size: z.string().optional(),
  name: z.string().trim().min(1, "Select a product"),
  sku: z.string().optional(),
  // Display only: the image saved on the line, for lines that no longer match a catalog option.
  imageUrl: z.string().optional(),
  quantity: z.coerce
    .number<string | number>()
    .int("Whole units only")
    .min(1, "Min 1"),
  unitPrice: z.coerce.number<string | number>().nonnegative("Must be ≥ 0"),
  // Carried over from the saved line on edit, so re-saving the items keeps the customization.
  customOptions: z.array(orderItemCustomOptionSchema).optional(),
  customizationTotal: z.number().optional(),
});
export type OrderItemFormInput = z.input<typeof orderItemFormSchema>;

export const orderShippingFormSchema = z.object({
  customerName: z.string().trim().max(120, "Keep it under 120 characters"),
  customerPhone: z
    .string()
    .trim()
    .refine(
      (phone) => phone === "" || PHONE_PATTERN.test(phone),
      "Enter a valid phone number",
    ),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  addressLine1: z.string().trim().max(300),
  addressLine2: z.string().trim().max(300),
  city: z.string().trim().max(100),
  state: z.string().trim().max(100),
  postalCode: z.string().trim().max(20),
  country: z.string().trim().min(1, "Country is required").max(60),
  notes: z.string().trim().max(500),
});
export type OrderShippingFormValues = z.infer<typeof orderShippingFormSchema>;

const orderFormBaseSchema = z.object({
  leadId: z.string().min(1, "Select a customer"),
  conversationId: z.string().optional(),
  status: z.enum(ORDER_CREATE_STATUSES),
  currency: z.string().min(1, "Select a currency"),
  discount: z.coerce.number<string | number>().nonnegative("Must be ≥ 0"),
  notes: z.string().trim().max(2000).optional(),
  shipping: orderShippingFormSchema,
  items: z.array(orderItemFormSchema).min(1, "Add at least one item"),
});

const REQUIRED_DELIVERY_FIELDS = [
  ["customerName", "Customer name is required"],
  ["customerPhone", "Phone number is required"],
  ["addressLine1", "Address is required"],
] as const satisfies readonly (readonly [keyof OrderShippingFormValues, string])[];

export const hasDeliveryAddress = (shipping: OrderShippingFormValues): boolean =>
  [
    shipping.addressLine1,
    shipping.addressLine2,
    shipping.city,
    shipping.state,
    shipping.postalCode,
  ].some((field) => field.trim() !== "");

export const getOrderLineTotal = (
  item: Pick<OrderItemFormInput, "quantity" | "unitPrice" | "customizationTotal">,
): number =>
  (Number(item.quantity) || 0) *
  ((Number(item.unitPrice) || 0) + (item.customizationTotal ?? 0));

export const getOrderLinesSubtotal = (
  items: readonly Pick<OrderItemFormInput, "quantity" | "unitPrice" | "customizationTotal">[],
): number => items.reduce((sum, item) => sum + getOrderLineTotal(item), 0);

/** Delivery is optional only when editing an order that was saved without one. */
export const getOrderFormSchema = (isDeliveryRequired: boolean) =>
  orderFormBaseSchema.superRefine((values, ctx) => {
    if (values.discount > getOrderLinesSubtotal(values.items)) {
      ctx.addIssue({
        code: "custom",
        path: ["discount"],
        message: "Discount can't exceed the subtotal",
      });
    }
    if (!isDeliveryRequired && !hasDeliveryAddress(values.shipping)) return;
    for (const [field, message] of REQUIRED_DELIVERY_FIELDS) {
      if (values.shipping[field] === "") {
        ctx.addIssue({ code: "custom", path: ["shipping", field], message });
      }
    }
  });

export type OrderFormInput = z.input<typeof orderFormBaseSchema>;
export type OrderFormValues = z.output<typeof orderFormBaseSchema>;
