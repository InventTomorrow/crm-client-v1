'use client';
import { useUrlState } from '@/shared/hooks/useUrlState';
import { Button } from '@/shared/ui/Button';
import { DataTable, type ColumnDef } from '@/shared/ui/DataTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useServiceOrderAction, useServiceOrders } from '../hooks/useServiceOrders';
import {
  formatOrderDate,
  getPriceSummary,
  getServiceOrderLabel,
  SERVICE_ORDER_STATUS_META,
  SERVICE_PAYMENT_STATUS_META,
} from '../lib/format';
import {
  SERVICE_ORDER_STATUSES,
  SERVICE_PAYMENT_STATUSES,
  type ServiceOrder,
  type ServiceOrderFilters,
  type ServiceOrderStatus,
  type ServicePaymentStatus,
} from '../types';
import { AddReceiptDialog } from './AddReceiptDialog';
import { ServiceOrderBadge } from './ServiceOrderBadge';
import { ServiceOrderDetailSheet } from './ServiceOrderDetailSheet';
import { ServiceOrderRowActions } from './ServiceOrderRowActions';

const ALL_FILTER_VALUE = '__all__';

export function ServiceOrdersView() {
  const [statusParam, setStatus] = useUrlState('sostatus');
  const [paymentStatusParam, setPaymentStatus] = useUrlState('sopayment');
  const [selectedServiceOrderId, setSelectedServiceOrderId] = useUrlState('order');
  const [orderForReceipt, setOrderForReceipt] = useState<ServiceOrder | null>(null);
  const [orderPendingCancellation, setOrderPendingCancellation] = useState<ServiceOrder | null>(null);
  const orderAction = useServiceOrderAction();

  const filters: ServiceOrderFilters = useMemo(
    () => ({
      ...(statusParam ? { status: statusParam as ServiceOrderStatus } : {}),
      ...(paymentStatusParam ? { paymentStatus: paymentStatusParam as ServicePaymentStatus } : {}),
    }),
    [statusParam, paymentStatusParam],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useServiceOrders(filters);
  const serviceOrders = useMemo(() => data?.pages.flatMap((page) => page.orders) ?? [], [data]);

  const columns: ColumnDef<ServiceOrder, unknown>[] = useMemo(
    () => [
      {
        id: 'order',
        accessorFn: (serviceOrder) => serviceOrder.orderNumber,
        header: 'Order',
        size: 150,
        cell: ({ row }) => (
          <div>
            <div className="text-[13px] font-medium text-[var(--ink)]">
              {getServiceOrderLabel(row.original.orderNumber)}
            </div>
            <div className="text-[11.5px] text-[var(--ink-mute)]">{formatOrderDate(row.original.createdAt)}</div>
          </div>
        ),
      },
      {
        id: 'customer',
        accessorFn: (serviceOrder) => serviceOrder.customerName ?? '',
        header: 'Customer',
        size: 170,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div dir="auto" className="truncate text-[13px] text-[var(--ink)]">
              {row.original.customerName || 'Unnamed customer'}
            </div>
            <div className="text-[11.5px] text-[var(--ink-mute)]">{row.original.customerPhone}</div>
          </div>
        ),
      },
      {
        id: 'services',
        accessorFn: (serviceOrder) => serviceOrder.lines.map((line) => line.serviceName).join(', '),
        header: 'Services',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="truncate text-[12.5px] text-[var(--ink)]">
              {row.original.lines.map((line) => `${line.serviceName} — ${line.planName}`).join(', ')}
            </div>
            <div className="text-[11.5px] text-[var(--ink-mute)]">
              {getPriceSummary(row.original.lines, row.original.currency)}
            </div>
          </div>
        ),
      },
      {
        id: 'status',
        accessorFn: (serviceOrder) => serviceOrder.status,
        header: 'Status',
        size: 130,
        cell: ({ row }) => <ServiceOrderBadge meta={SERVICE_ORDER_STATUS_META[row.original.status]} />,
      },
      {
        id: 'paymentStatus',
        accessorFn: (serviceOrder) => serviceOrder.paymentStatus,
        header: 'Payment',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <ServiceOrderBadge meta={SERVICE_PAYMENT_STATUS_META[row.original.paymentStatus]} />
            {row.original.paymentReceipts.length > 0 && (
              <span className="text-[11px] text-[var(--ink-mute)]">
                {row.original.paymentReceipts.length} receipt
                {row.original.paymentReceipts.length === 1 ? '' : 's'}
              </span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        size: 56,
        cell: ({ row }) => (
          <ServiceOrderRowActions
            serviceOrder={row.original}
            onView={(serviceOrder) => setSelectedServiceOrderId(serviceOrder.id)}
            onAddReceipt={setOrderForReceipt}
            onAction={(serviceOrder, action) =>
              orderAction.mutate({ serviceOrderId: serviceOrder.id, action })
            }
            onCancel={setOrderPendingCancellation}
            isActionPending={orderAction.isPending}
          />
        ),
      },
    ],
    [setSelectedServiceOrderId, orderAction],
  );

  return (
    <div className="w-full">
      <p className="mb-5 max-w-[62ch] text-[13px] text-[var(--ink-mute)]">
        Orders the assistant closed in chat. Services with payment collection on stay payment pending
        until the customer sends a receipt — open an order to view, download or add one.
      </p>

      <DataTable
        data={serviceOrders}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(serviceOrder) => setSelectedServiceOrderId(serviceOrder.id)}
        emptyMessage="No service orders yet. Orders the assistant takes in chat land here."
        defaultPageSize={20}
        maxBodyHeight="60vh"
        toolbar={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Select
              value={statusParam || ALL_FILTER_VALUE}
              onValueChange={(nextStatus) => setStatus(nextStatus === ALL_FILTER_VALUE ? '' : nextStatus)}
            >
              <SelectTrigger className="w-[160px] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All statuses</SelectItem>
                {SERVICE_ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {SERVICE_ORDER_STATUS_META[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentStatusParam || ALL_FILTER_VALUE}
              onValueChange={(nextPaymentStatus) =>
                setPaymentStatus(nextPaymentStatus === ALL_FILTER_VALUE ? '' : nextPaymentStatus)
              }
            >
              <SelectTrigger className="w-[180px] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER_VALUE}>All payments</SelectItem>
                {SERVICE_PAYMENT_STATUSES.map((paymentStatus) => (
                  <SelectItem key={paymentStatus} value={paymentStatus}>
                    {SERVICE_PAYMENT_STATUS_META[paymentStatus].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {hasNextPage && (
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <Loader2 size={13} className="animate-spin" />}
            Load more
          </Button>
        </div>
      )}

      {selectedServiceOrderId && (
        <ServiceOrderDetailSheet
          serviceOrderId={selectedServiceOrderId}
          onClose={() => setSelectedServiceOrderId('')}
        />
      )}

      <AddReceiptDialog
        serviceOrderId={orderForReceipt?.id ?? null}
        orderLabel={orderForReceipt ? getServiceOrderLabel(orderForReceipt.orderNumber) : ''}
        onClose={() => setOrderForReceipt(null)}
      />

      <ConfirmDialog
        open={!!orderPendingCancellation}
        onClose={() => setOrderPendingCancellation(null)}
        onConfirm={() => {
          if (!orderPendingCancellation) return;
          orderAction.mutate(
            { serviceOrderId: orderPendingCancellation.id, action: 'cancel' },
            { onSettled: () => setOrderPendingCancellation(null) },
          );
        }}
        title={`Cancel ${orderPendingCancellation ? getServiceOrderLabel(orderPendingCancellation.orderNumber) : 'order'}?`}
        description="The customer is told in their chat that the order was cancelled."
        confirmLabel="Cancel order"
        loading={orderAction.isPending}
      />
    </div>
  );
}
