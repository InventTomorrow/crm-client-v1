import { apiClient } from '@/lib/apiClient';
import type { Order, OrderFilters, OrderListItem, OrderStatus, OrdersSummary } from '../types';
import type { OrderFormValues } from '../validations.order';

export async function getOrders(params: OrderFilters & { cursor?: string; limit?: number }) {
  const res = await apiClient.get<{ success: true; data: OrderListItem[] }>('/orders', { params });
  return res.data.data;
}

export async function getOrdersSummary() {
  const res = await apiClient.get<{ success: true; data: OrdersSummary }>('/orders/summary');
  return res.data.data;
}

export async function getOrder(id: string) {
  const res = await apiClient.get<{ success: true; data: Order }>(`/orders/${id}`);
  return res.data.data;
}

export async function createOrder(payload: OrderFormValues) {
  const res = await apiClient.post<{ success: true; data: Order }>('/orders', payload);
  return res.data.data;
}

export async function updateOrder(id: string, payload: Partial<OrderFormValues>) {
  const res = await apiClient.put<{ success: true; data: Order }>(`/orders/${id}`, payload);
  return res.data.data;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  note?: string,
  notifyCustomer?: boolean,
) {
  const res = await apiClient.patch<{ success: true; data: Order }>(`/orders/${id}/status`, {
    status,
    note,
    notifyCustomer,
  });
  return res.data.data;
}

export async function deleteOrder(id: string) {
  const res = await apiClient.delete(`/orders/${id}`);
  return res.data;
}
