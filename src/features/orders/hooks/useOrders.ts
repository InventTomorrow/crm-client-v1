'use client';
import {
  keepPreviousData,
  useIsFetching,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { PaginationState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { downloadBlob, extractErrorMessage } from '@/lib/utils';
import {
  createOrder,
  deleteOrder,
  exportOrdersCsv,
  getOrder,
  getOrders,
  getOrdersPage,
  getOrdersSummary,
  importOrdersCsv,
  updateOrder,
  updateOrderStatus,
} from '../services/ordersService';
import type {
  CreateOrderPayload,
  OrderExportParams,
  OrderFilters,
  OrderListItem,
  OrderStatus,
  UpdateOrderPayload,
} from '../types';

const DEFAULT_ORDERS_PAGE_SIZE = 20;
const NO_ORDERS: OrderListItem[] = [];

const keys = {
  all: ['orders'] as const,
  page: (filters: OrderFilters, pagination: PaginationState) =>
    ['orders', 'list', filters, pagination.pageIndex, pagination.pageSize] as const,
  summary: ['orders', 'summary'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};

/** Page state that falls back to page one whenever the filters change. */
function useOrdersPagination(filters: OrderFilters) {
  const filtersKey = JSON.stringify(filters);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0,
    pageSize: DEFAULT_ORDERS_PAGE_SIZE,
    filtersKey,
  });
  const pagination: PaginationState = {
    pageIndex: paginationState.filtersKey === filtersKey ? paginationState.pageIndex : 0,
    pageSize: paginationState.pageSize,
  };
  const setPagination = useCallback(
    (nextPagination: PaginationState) => setPaginationState({ ...nextPagination, filtersKey }),
    [filtersKey],
  );
  return { pagination, setPagination };
}

export function usePaginatedOrders(filters: OrderFilters) {
  const { pagination, setPagination } = useOrdersPagination(filters);
  const { pageIndex, pageSize } = pagination;
  const ordersPageQuery = useQuery({
    queryKey: keys.page(filters, pagination),
    queryFn: () => getOrdersPage({ ...filters, page: pageIndex + 1, limit: pageSize }),
    placeholderData: keepPreviousData,
  });

  const totalOrders = ordersPageQuery.data?.total ?? 0;
  const lastPageIndex = Math.max(0, Math.ceil(totalOrders / pageSize) - 1);
  const isPastLastPage =
    !!ordersPageQuery.data && !ordersPageQuery.isPlaceholderData && pageIndex > lastPageIndex;

  // Deleting the last orders of the final page would otherwise leave an empty page behind.
  useEffect(() => {
    if (isPastLastPage) setPagination({ pageIndex: lastPageIndex, pageSize });
  }, [isPastLastPage, lastPageIndex, pageSize, setPagination]);

  return {
    orders: ordersPageQuery.data?.orders ?? NO_ORDERS,
    totalOrders,
    isLoading: ordersPageQuery.isLoading,
    pagination,
    setPagination,
  };
}

export function useOrdersSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: getOrdersSummary });
}

// Shares the summary cache with useOrdersSummary (same key + select) so the
// sidebar badge never triggers its own /orders/summary request.
export function usePendingOrdersCount() {
  return useQuery({
    queryKey: keys.summary,
    queryFn: getOrdersSummary,
    select: (summary) =>
      summary.byStatus.find((s) => s.status === 'PENDING')?.count ?? 0,
    refetchInterval: 300_000,
  });
}

export function useLeadOrders(leadId: string | null | undefined) {
  return useQuery({
    queryKey: ['orders', 'lead', leadId],
    queryFn: () => getOrders({ leadId: leadId!, limit: 10 }),
    enabled: !!leadId,
    staleTime: 30_000,
  });
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ''),
    queryFn: () => getOrder(id as string),
    enabled: !!id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: keys.all });
}

/** Manual refresh for the orders page — re-fetches the list and the summary cards. */
export function useRefreshOrders() {
  const qc = useQueryClient();
  const isRefreshing = useIsFetching({ queryKey: keys.all }) > 0;
  return { refreshOrders: () => invalidateAll(qc), isRefreshing };
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      toast.success('Order created');
      invalidateAll(qc);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to create order')),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOrderPayload }) =>
      updateOrder(id, payload),
    onSuccess: () => {
      toast.success('Order updated');
      invalidateAll(qc);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to update order')),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
      notifyCustomer,
    }: {
      id: string;
      status: OrderStatus;
      note?: string;
      notifyCustomer?: boolean;
    }) => updateOrderStatus(id, status, note, notifyCustomer),
    onSuccess: () => invalidateAll(qc),
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to change status')),
  });
}

export function useDeleteOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      toast.success('Order deleted');
      invalidateAll(qc);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to delete order')),
  });
}

export function useExportOrders() {
  return useMutation({
    mutationFn: async ({ filename, ...params }: OrderExportParams & { filename: string }) =>
      downloadBlob(await exportOrdersCsv(params), `${filename}.csv`),
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to export orders')),
  });
}

/** Dry run: validates the CSV and reports what would be imported, without saving. */
export function usePreviewOrdersImport() {
  return useMutation({
    mutationFn: (csv: string) => importOrdersCsv({ csv, dryRun: true }),
    onError: (e) => toast.error(extractErrorMessage(e, 'Could not read the CSV')),
  });
}

export function useCommitOrdersImport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => importOrdersCsv({ csv, dryRun: false }),
    onSuccess: ({ counts }) => {
      toast.success(`Imported ${counts.created} order${counts.created === 1 ? '' : 's'}`);
      invalidateAll(qc);
    },
    onError: (e) => toast.error(extractErrorMessage(e, 'Failed to import orders')),
  });
}

/** Returns DRAFT orders linked to a specific conversation. Refreshes on SSE new-draft-order events. */
