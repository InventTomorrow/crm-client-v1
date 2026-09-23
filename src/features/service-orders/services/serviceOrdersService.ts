import { apiClient } from '@/lib/apiClient';
import type {
  AddPaymentReceiptForm,
  ServiceOrder,
  ServiceOrderAction,
  ServiceOrderActionResult,
  ServiceOrderFilters,
  ServiceOrdersPage,
} from '../types';

const BASE = '/service-orders';

export async function getServiceOrders(
  params: ServiceOrderFilters & { cursor?: string; limit: number },
): Promise<ServiceOrdersPage> {
  const res = await apiClient.get<{ success: true; data: ServiceOrdersPage }>(BASE, { params });
  return res.data.data;
}

export async function getServiceOrder(serviceOrderId: string): Promise<ServiceOrder> {
  const res = await apiClient.get<{ success: true; data: ServiceOrder }>(`${BASE}/${serviceOrderId}`);
  return res.data.data;
}

export async function runServiceOrderAction(
  serviceOrderId: string,
  action: ServiceOrderAction,
): Promise<ServiceOrderActionResult> {
  const res = await apiClient.post<{ success: true; data: ServiceOrderActionResult }>(
    `${BASE}/${serviceOrderId}/${action}`,
  );
  return res.data.data;
}

export async function addPaymentReceipt(
  serviceOrderId: string,
  receipt: AddPaymentReceiptForm,
): Promise<ServiceOrder> {
  const res = await apiClient.post<{ success: true; data: ServiceOrder }>(
    `${BASE}/${serviceOrderId}/receipts`,
    { url: receipt.url, note: receipt.note || null },
  );
  return res.data.data;
}

export async function removePaymentReceipt(
  serviceOrderId: string,
  receiptId: string,
): Promise<ServiceOrder> {
  const res = await apiClient.delete<{ success: true; data: ServiceOrder }>(
    `${BASE}/${serviceOrderId}/receipts/${receiptId}`,
  );
  return res.data.data;
}
