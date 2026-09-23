'use client';
import { extractErrorMessage } from '@/lib/utils';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  addPaymentReceipt,
  getServiceOrder,
  getServiceOrders,
  removePaymentReceipt,
  runServiceOrderAction,
} from '../services/serviceOrdersService';
import type {
  AddPaymentReceiptForm,
  ServiceOrder,
  ServiceOrderAction,
  ServiceOrderFilters,
  ServiceOrdersPage,
} from '../types';

const PAGE_SIZE = 20;

const serviceOrderKeys = {
  all: ['service-orders'] as const,
  list: (filters: ServiceOrderFilters) => ['service-orders', 'list', filters] as const,
  detail: (serviceOrderId: string) => ['service-orders', 'detail', serviceOrderId] as const,
};

type CachedSnapshot = [readonly unknown[], unknown][];

export function useServiceOrders(filters: ServiceOrderFilters) {
  return useInfiniteQuery({
    queryKey: serviceOrderKeys.list(filters),
    queryFn: ({ pageParam }) =>
      getServiceOrders({ ...filters, limit: PAGE_SIZE, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

export function useServiceOrder(serviceOrderId: string | null) {
  return useQuery({
    queryKey: serviceOrderKeys.detail(serviceOrderId ?? ''),
    queryFn: () => getServiceOrder(serviceOrderId as string),
    enabled: !!serviceOrderId,
  });
}

/** Patches the detail query and every list page holding the order, so the change shows wherever it is open. */
function useOptimisticOrderPatch() {
  const queryClient = useQueryClient();

  return async (
    serviceOrderId: string,
    patchOrder: (order: ServiceOrder) => ServiceOrder,
  ): Promise<CachedSnapshot> => {
    await queryClient.cancelQueries({ queryKey: serviceOrderKeys.all });
    const snapshot = queryClient.getQueriesData({ queryKey: serviceOrderKeys.all });

    queryClient.setQueryData<ServiceOrder>(serviceOrderKeys.detail(serviceOrderId), (current) =>
      current ? patchOrder(current) : current,
    );
    queryClient.setQueriesData<InfiniteData<ServiceOrdersPage>>(
      { queryKey: [...serviceOrderKeys.all, 'list'] },
      (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                orders: page.orders.map((order) =>
                  order.id === serviceOrderId ? patchOrder(order) : order,
                ),
              })),
            }
          : current,
    );
    return snapshot;
  };
}

function useRollbackCallbacks(fallbackMessage: string) {
  const queryClient = useQueryClient();
  return {
    onError: (error: unknown, _variables: unknown, snapshot?: CachedSnapshot) => {
      snapshot?.forEach(([queryKey, cachedData]) => queryClient.setQueryData(queryKey, cachedData));
      toast.error(extractErrorMessage(error, fallbackMessage));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: serviceOrderKeys.all }),
  };
}

const ACTION_PATCHES: Record<ServiceOrderAction, (order: ServiceOrder) => ServiceOrder> = {
  confirm: (order) => ({ ...order, status: order.status === 'NEW' ? 'CONFIRMED' : order.status }),
  'mark-paid': (order) => ({
    ...order,
    paymentStatus: 'PAID',
    status: order.status === 'NEW' ? 'CONFIRMED' : order.status,
  }),
  cancel: (order) => ({ ...order, status: 'CANCELLED' }),
};

const ACTION_MESSAGES: Record<ServiceOrderAction, string> = {
  confirm: 'Order confirmed',
  'mark-paid': 'Marked as paid',
  cancel: 'Order cancelled',
};

export function useServiceOrderAction() {
  const patchOrder = useOptimisticOrderPatch();
  const rollback = useRollbackCallbacks('Failed to update the order');

  return useMutation({
    mutationFn: ({ serviceOrderId, action }: { serviceOrderId: string; action: ServiceOrderAction }) =>
      runServiceOrderAction(serviceOrderId, action),
    onMutate: ({ serviceOrderId, action }) => patchOrder(serviceOrderId, ACTION_PATCHES[action]),
    onSuccess: (result, { action }) => {
      if (result.outcome === 'done') toast.success(ACTION_MESSAGES[action]);
      else if (result.outcome === 'already') toast.info('Already done');
      else toast.error('Not allowed for this order');
    },
    ...rollback,
  });
}

export function useAddPaymentReceipt() {
  const patchOrder = useOptimisticOrderPatch();
  const rollback = useRollbackCallbacks('Failed to attach the receipt');

  return useMutation({
    mutationFn: ({ serviceOrderId, receipt }: { serviceOrderId: string; receipt: AddPaymentReceiptForm }) =>
      addPaymentReceipt(serviceOrderId, receipt),
    onMutate: ({ serviceOrderId, receipt }) =>
      patchOrder(serviceOrderId, (order) => ({
        ...order,
        paymentStatus: 'PAID',
        paymentReceipts: [
          ...order.paymentReceipts,
          {
            id: `pending-${Date.now()}`,
            url: receipt.url,
            note: receipt.note || null,
            source: 'STAFF',
            uploadedByUserId: null,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
    onSuccess: () => toast.success('Receipt attached'),
    ...rollback,
  });
}

export function useRemovePaymentReceipt() {
  const patchOrder = useOptimisticOrderPatch();
  const rollback = useRollbackCallbacks('Failed to remove the receipt');

  return useMutation({
    mutationFn: ({ serviceOrderId, receiptId }: { serviceOrderId: string; receiptId: string }) =>
      removePaymentReceipt(serviceOrderId, receiptId),
    onMutate: ({ serviceOrderId, receiptId }) =>
      patchOrder(serviceOrderId, (order) => ({
        ...order,
        paymentReceipts: order.paymentReceipts.filter((receipt) => receipt.id !== receiptId),
      })),
    onSuccess: () => toast.success('Receipt removed'),
    ...rollback,
  });
}
