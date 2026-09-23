import type { BillingCycle } from '@/features/services/types';
import { z } from 'zod';

// Mirrors the server ServiceOrderStatus / ServicePaymentStatus enums.
export const SERVICE_ORDER_STATUSES = ['NEW', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
export type ServiceOrderStatus = (typeof SERVICE_ORDER_STATUSES)[number];

export const SERVICE_PAYMENT_STATUSES = ['UNPAID', 'PENDING', 'PARTIALLY_PAID', 'PAID'] as const;
export type ServicePaymentStatus = (typeof SERVICE_PAYMENT_STATUSES)[number];

export interface ServiceOrderLine {
  serviceOfferingId: string;
  serviceName: string;
  planKey: string;
  planName: string;
  price: number;
  billingCycle: BillingCycle;
  minContractMonths: number;
}

export interface PaymentReceipt {
  id: string;
  url: string;
  note: string | null;
  source: 'CUSTOMER' | 'STAFF';
  uploadedByUserId: string | null;
  createdAt: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: number;
  leadId: string;
  conversationId: string | null;
  closeMode: 'CHAT' | 'CALL';
  status: ServiceOrderStatus;
  paymentStatus: ServicePaymentStatus;
  paymentRequired: boolean;
  paymentReceipts: PaymentReceipt[];
  customerName: string | null;
  customerPhone: string;
  customerEmail: string | null;
  businessName: string | null;
  lines: ServiceOrderLine[];
  currency: string;
  briefSummary: string | null;
  briefAnswers: { label: string; value: string }[];
  notes: string | null;
  cancelReason: string | null;
  confirmedAt: string | null;
  createdAt: string;
}

export interface ServiceOrdersPage {
  orders: ServiceOrder[];
  nextCursor: string | null;
}

export interface ServiceOrderFilters {
  status?: ServiceOrderStatus;
  paymentStatus?: ServicePaymentStatus;
}

export type ServiceOrderAction = 'confirm' | 'mark-paid' | 'cancel';

export interface ServiceOrderActionResult {
  outcome: 'done' | 'already' | 'not_allowed';
  order: ServiceOrder;
}

export const addPaymentReceiptSchema = z.object({
  url: z.string().min(1, 'Upload the receipt image first'),
  note: z.string().trim().max(500, 'Keep the note under 500 characters'),
});
export type AddPaymentReceiptForm = z.infer<typeof addPaymentReceiptSchema>;
