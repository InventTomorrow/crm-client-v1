export const ORDER_STATUSES = [
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'FULFILLED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

// Curated, non-duplicate set shown in the filter dropdown + status picker.
// The DB/type still accept every legacy value (e.g. FULFILLED) for display.
export const ORDER_STATUS_OPTIONS = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'COMPLETED',
  'CANCELLED',
] as const satisfies readonly OrderStatus[];

export type OrderPlatform = 'SHOPIFY' | 'INTERNAL' | 'API';

/** One answered custom option, snapshotted onto the line at order time. */
export interface OrderItemCustomOption {
  key: string;
  label: string;
  value: string;
  /** Artwork the customer sent, for an IMAGE option — capped at 3. */
  imageUrls?: string[];
  priceDelta: number;
  requiresQuote: boolean;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: string; // Decimal serialized as string
  subtotal: string;
  /** Null on every uncustomized line, including every historical one. */
  customOptions?: OrderItemCustomOption[] | null;
  /** Per-unit surcharge already included in unitPrice. */
  customizationTotal?: number;
  /** Artwork beyond the three attached, or a spec a human still has to settle. */
  customizationNote?: string | null;
}

/** Whether an order is held waiting on the team to price custom work. */
export const ORDER_QUOTE_STATUSES = [
  "NONE",
  "PENDING",
  "QUOTED",
  "ACCEPTED",
] as const;
export type OrderQuoteStatus = (typeof ORDER_QUOTE_STATUSES)[number];

export interface OrderStatusHistoryEntry {
  id: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByUserId: string | null;
  changedBySystem: boolean;
  note: string | null;
  createdAt: string;
}

export interface OrderLeadRef {
  id: string;
  name: string | null;
  phone: string | null;
}

/** Row shape returned by the list endpoint (items reduced to a count). */
export interface OrderListItem {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  platform: OrderPlatform;
  isSandbox: boolean;
  customerName: string | null;
  customerPhone: string | null;
  total: string;
  currency: string;
  createdAt: string;
  items: { id: string }[];
  lead: OrderLeadRef | null;
  /** True when any line carries a custom option. */
  hasCustomization?: boolean;
}

export interface OrderShippingDetail {
  id: string;
  customerName: string;
  customerPhone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  notes: string | null;
}

/** Full detail shape returned by GET /orders/:id. */
export interface Order extends Omit<OrderListItem, 'items'> {
  leadId: string;
  conversationId: string | null;
  notes: string | null;
  cancellationReason: string | null;
  subtotal: string;
  discount: string;
  placedAt: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
  shippingDetail: OrderShippingDetail | null;
  /** Absent on orders that predate the quote workflow — treat as "NONE". */
  quoteStatus?: OrderQuoteStatus;
}

export interface OrdersSummary {
  total: number;
  revenue: string | number;
  byStatus: { status: OrderStatus; count: number }[];
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  platform?: OrderPlatform;
  leadId?: string;
  conversationId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasCustomization?: boolean;
}
