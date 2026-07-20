export interface CheckoutItem {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutShipping {
  customerName: string;
  customerPhone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface PublicCheckout {
  token: string | null;
  orderNumber: number;
  status: string;
  currency: string;
  tenantName: string;
  customerName: string | null;
  items: CheckoutItem[];
  subtotal: number;
  discount: number;
  total: number;
  placedAt: string | null;
  shipping: CheckoutShipping | null;
}

export interface CheckoutContactPatch {
  customerName?: string;
  customerPhone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
}

export interface ReceiptChannels {
  whatsapp: boolean;
  email: boolean;
}

export interface ReceiptResult {
  whatsapp: string;
  email: string;
}
