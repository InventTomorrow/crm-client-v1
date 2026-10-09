import type { Lead } from "@/features/leads/types";
import type {
  CreateOrderPayload,
  Order,
  OrderItemPayload,
  OrderShippingPayload,
  UpdateOrderPayload,
} from "../types";
import {
  hasDeliveryAddress,
  type OrderFormValues,
  type OrderItemFormInput,
  type OrderShippingFormValues,
} from "../validations.order";

type OrderLineValues = OrderFormValues["items"][number];

const DEFAULT_COUNTRY = "PK";
// The leads list fills a missing name or city with this placeholder.
const UNKNOWN_LEAD_VALUE = "Unknown";

export const EMPTY_ORDER_LINE: OrderItemFormInput = {
  productId: undefined,
  variantId: undefined,
  size: "",
  name: "",
  sku: "",
  imageUrl: undefined,
  quantity: 1,
  unitPrice: 0,
};

const EMPTY_SHIPPING: OrderShippingFormValues = {
  customerName: "",
  customerPhone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: DEFAULT_COUNTRY,
  notes: "",
};

const round2 = (amount: number): number => Math.round(amount * 100) / 100;

const withText = <Key extends string>(key: Key, text: string | undefined) =>
  (text?.trim() ? { [key]: text.trim() } : {}) as Partial<Record<Key, string>>;

export const getNewOrderFormValues = (
  presetLeadId: string | undefined,
  presetConversationId: string | undefined,
): OrderFormValues => ({
  leadId: presetLeadId ?? "",
  conversationId: presetConversationId,
  status: "PENDING",
  currency: "PKR",
  discount: 0,
  notes: "",
  shipping: EMPTY_SHIPPING,
  items: [{ ...EMPTY_ORDER_LINE, quantity: 1, unitPrice: 0 }],
});

export const getSavedOrderFormValues = (order: Order): OrderFormValues => {
  const savedShipping = order.shippingDetail;
  return {
    leadId: order.leadId,
    conversationId: order.conversationId ?? undefined,
    status: "PENDING",
    currency: order.currency,
    discount: Number(order.discount),
    notes: order.notes ?? "",
    shipping: savedShipping
      ? {
          customerName: savedShipping.customerName,
          customerPhone: savedShipping.customerPhone,
          email: savedShipping.email ?? "",
          addressLine1: savedShipping.addressLine1,
          addressLine2: savedShipping.addressLine2 ?? "",
          city: savedShipping.city ?? "",
          state: savedShipping.state ?? "",
          postalCode: savedShipping.postalCode ?? "",
          country: savedShipping.country || DEFAULT_COUNTRY,
          notes: savedShipping.notes ?? "",
        }
      : {
          ...EMPTY_SHIPPING,
          customerName: order.customerName ?? order.lead?.name ?? "",
          customerPhone: order.customerPhone ?? order.lead?.phone ?? "",
        },
    items: order.items.map((item) => ({
      productId: item.productId ?? undefined,
      variantId: item.variantId ?? undefined,
      size: "",
      name: item.name,
      sku: item.sku ?? "",
      imageUrl: item.imageUrl ?? undefined,
      quantity: item.quantity,
      // The saved price already includes the customization surcharge; the server adds it back on save.
      unitPrice: round2(Number(item.unitPrice) - (item.customizationTotal ?? 0)),
      customOptions: item.customOptions ?? undefined,
      customizationTotal: item.customizationTotal ?? 0,
    })),
  };
};

/** Contact details a lead already has, for the order's delivery fields. */
export const getLeadContact = (
  lead: Pick<Lead, "name" | "phone" | "email" | "city">,
): Pick<OrderShippingFormValues, "customerName" | "customerPhone" | "email" | "city"> => {
  const hasRealName =
    !!lead.name && lead.name !== UNKNOWN_LEAD_VALUE && lead.name !== lead.phone;
  return {
    customerName: hasRealName ? lead.name : "",
    customerPhone: lead.phone ?? "",
    email: lead.email ?? "",
    city: lead.city && lead.city !== UNKNOWN_LEAD_VALUE ? lead.city : "",
  };
};

const toOrderItemPayload = (line: OrderLineValues): OrderItemPayload => ({
  ...withText("productId", line.productId),
  ...withText("variantId", line.variantId),
  name: line.name,
  ...withText("sku", line.sku),
  quantity: line.quantity,
  unitPrice: line.unitPrice,
  ...(line.customOptions?.length ? { customOptions: line.customOptions } : {}),
});

const toShippingPayload = (
  shipping: OrderShippingFormValues,
): OrderShippingPayload => ({
  customerName: shipping.customerName,
  customerPhone: shipping.customerPhone,
  ...withText("email", shipping.email),
  addressLine1: shipping.addressLine1,
  ...withText("addressLine2", shipping.addressLine2),
  ...withText("city", shipping.city),
  ...withText("state", shipping.state),
  ...withText("postalCode", shipping.postalCode),
  country: shipping.country,
  ...withText("notes", shipping.notes),
});

const getShippingPayload = (shipping: OrderShippingFormValues) =>
  hasDeliveryAddress(shipping) ? { shipping: toShippingPayload(shipping) } : {};

export const toCreateOrderPayload = (
  values: OrderFormValues,
): CreateOrderPayload => ({
  leadId: values.leadId,
  ...withText("conversationId", values.conversationId),
  status: values.status,
  currency: values.currency,
  discount: values.discount,
  ...withText("notes", values.notes),
  items: values.items.map(toOrderItemPayload),
  ...getShippingPayload(values.shipping),
});

export const haveOrderLinesChanged = (
  savedLines: readonly OrderLineValues[],
  editedLines: readonly OrderLineValues[],
): boolean =>
  JSON.stringify(savedLines.map(toOrderItemPayload)) !==
  JSON.stringify(editedLines.map(toOrderItemPayload));

// Lines are sent only when they changed: re-sending them re-prices custom options and resets a settled quote.
export const toUpdateOrderPayload = (
  values: OrderFormValues,
  shouldSendLines: boolean,
): UpdateOrderPayload => ({
  currency: values.currency,
  discount: values.discount,
  notes: values.notes ?? "",
  ...(shouldSendLines ? { items: values.items.map(toOrderItemPayload) } : {}),
  ...getShippingPayload(values.shipping),
});
