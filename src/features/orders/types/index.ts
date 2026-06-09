export const ORDER_STATUSES = [
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PAID',
  'FULFILLED',
  'COMPLETED',
  'CANCELLED',
  'REFUNDED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderPlatform = 'SHOPIFY' | 'INTERNAL';

export interface OrderItem {
  id: string;
  productId: string | null;
  variantId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: string; // Decimal serialized as string
  subtotal: string;
}

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
  customerName: string | null;
  customerPhone: string | null;
  total: string;
  currency: string;
  createdAt: string;
  items: { id: string }[];
  lead: OrderLeadRef | null;
}

/** Full detail shape returned by GET /orders/:id. */
export interface Order extends Omit<OrderListItem, 'items'> {
  leadId: string;
  conversationId: string | null;
  notes: string | null;
  subtotal: string;
  discount: string;
  placedAt: string | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
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
  dateFrom?: string;
  dateTo?: string;
}
