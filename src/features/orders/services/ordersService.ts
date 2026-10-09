import { apiClient } from '@/lib/apiClient';
import { isAxiosError } from 'axios';
import type {
  CreateOrderPayload,
  Order,
  OrderExportParams,
  OrderFilters,
  OrderImportResult,
  OrderListItem,
  OrderStatus,
  OrdersSummary,
  UpdateOrderPayload,
} from '../types';

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

export async function createOrder(payload: CreateOrderPayload) {
  const res = await apiClient.post<{ success: true; data: Order }>('/orders', payload);
  return res.data.data;
}

export async function updateOrder(id: string, payload: UpdateOrderPayload) {
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

// A blob request also receives its JSON error body as a blob; parse it so the API message reaches the toast.
async function withParsedBlobError(error: unknown): Promise<unknown> {
  if (!isAxiosError(error) || !(error.response?.data instanceof Blob)) return error;
  try {
    error.response.data = JSON.parse(await error.response.data.text());
  } catch {
    // Not JSON — leave the generic message in place.
  }
  return error;
}

export async function exportOrdersCsv({ ids, ...filters }: OrderExportParams): Promise<Blob> {
  try {
    const res = await apiClient.get<Blob>('/orders/export', {
      params: {
        ...filters,
        ...(ids?.length ? { ids: ids.join(',') } : {}),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      responseType: 'blob',
    });
    return res.data;
  } catch (error) {
    throw await withParsedBlobError(error);
  }
}

export async function importOrdersCsv(payload: { csv: string; dryRun: boolean }) {
  const res = await apiClient.post<{ success: true; data: OrderImportResult }>(
    '/orders/import',
    payload,
  );
  return res.data.data;
}
