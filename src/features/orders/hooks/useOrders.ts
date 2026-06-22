'use client';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import {
  createOrder,
  deleteOrder,
  getOrder,
  getOrders,
  getOrdersSummary,
  updateOrder,
  updateOrderStatus,
} from '../services/ordersService';
import type { OrderFilters, OrderStatus } from '../types';
import type { OrderFormValues } from '../validations.order';

const PAGE_SIZE = 25;

const keys = {
  all: ['orders'] as const,
  list: (filters: OrderFilters) => ['orders', 'list', filters] as const,
  summary: ['orders', 'summary'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};

export function useOrders(filters: OrderFilters) {
  return useInfiniteQuery({
    queryKey: keys.list(filters),
    queryFn: ({ pageParam }) => getOrders({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === PAGE_SIZE ? lastPage[lastPage.length - 1]?.id : undefined,
  });
}

export function useOrdersSummary() {
  return useQuery({ queryKey: keys.summary, queryFn: getOrdersSummary });
}

export function usePendingOrdersCount() {
  return useQuery({
    queryKey: [...keys.summary, 'pending-count'],
    queryFn: async () => {
      const summary = await getOrdersSummary();
      return summary.byStatus.find((s) => s.status === 'PENDING')?.count ?? 0;
    },
    refetchInterval: 30_000,
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

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderFormValues) => createOrder(payload),
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
    mutationFn: ({ id, payload }: { id: string; payload: Partial<OrderFormValues> }) =>
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

/** Returns DRAFT orders linked to a specific conversation. Refreshes on SSE new-draft-order events. */
