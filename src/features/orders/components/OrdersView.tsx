'use client';
import { useMemo, useState } from 'react';
import { Loader2, Plus, Search, ShoppingCart } from 'lucide-react';
import { useCreateOrder, useOrders, useOrdersSummary, useUpdateOrder } from '../hooks/useOrders';
import { ORDER_STATUSES, type Order, type OrderFilters, type OrderStatus } from '../types';
import { formatMoney } from '../lib/format';
import { ORDER_STATUS_META } from '../lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderDetailSheet } from './OrderDetailSheet';
import { OrderForm } from './OrderForm';

export function OrdersView() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const filters: OrderFilters = useMemo(
    () => ({ ...(search ? { search } : {}), ...(status ? { status } : {}) }),
    [search, status],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useOrders(filters);
  const { data: summary } = useOrdersSummary();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();

  const orders = useMemo(() => data?.pages.flat() ?? [], [data]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (order: Order) => {
    setSelectedId(null);
    setEditing(order);
    setFormOpen(true);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">Orders</h1>
          <p className="text-[13px] text-[var(--ink-mute)] mt-0.5">
            {summary ? `${summary.total} orders · ${formatMoney(summary.revenue ?? 0)} revenue` : 'Manage your orders'}
          </p>
        </div>
        <button className="btn btn-grad" onClick={openCreate}>
          <Plus size={15} /> New order
        </button>
      </div>

      {/* Summary cards */}
      {summary && summary.byStatus.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {summary.byStatus.slice(0, 4).map((s) => (
            <div key={s.status} className="card p-3.5">
              <div className="text-[12px] text-[var(--ink-mute)]">{ORDER_STATUS_META[s.status].label}</div>
              <div className="text-[20px] font-semibold text-[var(--ink)] mt-0.5">{s.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" />
          <input
            className="input pl-9"
            placeholder="Search by order #, customer, phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input sm:w-[180px]" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus | '')}>
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:grid grid-cols-[80px_1fr_90px_120px_140px_120px] gap-3 px-4 py-2.5 border-b border-[var(--line)] text-[11px] uppercase tracking-wide text-[var(--ink-mute)] font-medium">
          <div>Order</div>
          <div>Customer</div>
          <div className="text-center">Items</div>
          <div className="text-right">Total</div>
          <div>Status</div>
          <div className="text-right">Date</div>
        </div>

        {isLoading && (
          <div className="p-10 text-center text-[var(--ink-mute)]">
            <Loader2 size={20} className="animate-spin inline" />
          </div>
        )}
        {!isLoading && orders.length === 0 && (
          <div className="p-12 text-center text-[var(--ink-mute)] text-[13px] flex flex-col items-center gap-2">
            <ShoppingCart size={28} className="opacity-40" />
            No orders yet.
          </div>
        )}

        {orders.map((o) => (
          <button
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className="w-full text-left grid grid-cols-1 md:grid-cols-[80px_1fr_90px_120px_140px_120px] gap-1 md:gap-3 px-4 py-3 border-b border-[var(--line-soft)] last:border-0 hover:bg-[var(--surface-2)] transition-colors items-center"
          >
            <div className="text-[13px] font-semibold text-[var(--ink)]">#{o.orderNumber}</div>
            <div className="min-w-0">
              <div className="text-[13px] text-[var(--ink)] truncate">{o.customerName || o.lead?.name || 'Unknown'}</div>
              <div className="text-[11.5px] text-[var(--ink-mute)] md:hidden">
                {o.items.length} items · {formatMoney(o.total, o.currency)}
              </div>
            </div>
            <div className="hidden md:block text-center text-[13px] text-[var(--ink-soft)]">{o.items.length}</div>
            <div className="hidden md:block text-right text-[13px] font-medium text-[var(--ink)]">
              {formatMoney(o.total, o.currency)}
            </div>
            <div>
              <OrderStatusBadge status={o.status} />
            </div>
            <div className="hidden md:block text-right text-[12px] text-[var(--ink-mute)]">
              {new Date(o.createdAt).toLocaleDateString()}
            </div>
          </button>
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-4">
          <button className="btn btn-outline text-[12.5px]" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <Loader2 size={14} className="animate-spin" />}
            Load more
          </button>
        </div>
      )}

      {/* Detail sheet */}
      {selectedId && <OrderDetailSheet orderId={selectedId} onClose={() => setSelectedId(null)} onEdit={openEdit} />}

      {/* Create / edit form */}
      <OrderForm
        open={formOpen}
        initial={editing}
        onClose={() => setFormOpen(false)}
        isSubmitting={createOrder.isPending || updateOrder.isPending}
        onSubmit={(values) => {
          if (editing) {
            updateOrder.mutate(
              { id: editing.id, payload: values },
              { onSuccess: () => setFormOpen(false) },
            );
          } else {
            createOrder.mutate(values, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />
    </div>
  );
}
