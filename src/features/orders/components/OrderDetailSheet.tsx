'use client';
import { useMemo, useState } from 'react';
import { Loader2, Package, Pencil, Trash2, X } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { useDeleteOrder, useOrder, useUpdateOrderStatus } from '../hooks/useOrders';
import type { Order } from '../types';
import { formatMoney } from '../lib/format';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderStatusSelect } from './OrderStatusSelect';

interface Props {
  orderId: string;
  onClose: () => void;
  onEdit: (order: Order) => void;
}

export function OrderDetailSheet({ orderId, onClose, onEdit }: Props) {
  const { data: order, isLoading } = useOrder(orderId);
  const changeStatus = useUpdateOrderStatus();
  const del = useDeleteOrder();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[460px] max-w-[calc(100vw-28px)] z-[70]">
        <div className="flex items-center justify-between p-[18px] border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[16px] font-semibold text-[var(--ink)]">
              {order ? `Order #${order.orderNumber}` : 'Order'}
            </h3>
            {order && <OrderStatusBadge status={order.status} />}
          </div>
          <button className="btn btn-ghost p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scroll p-[18px] flex flex-col gap-4">
          {isLoading || !order ? (
            <div className="flex items-center justify-center py-16 text-[var(--ink-mute)]">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : (
            <>
              {/* Customer */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1">Customer</div>
                <div className="text-[14px] font-medium text-[var(--ink)]">
                  {order.customerName || order.lead?.name || 'Unknown'}
                </div>
                {(order.customerPhone || order.lead?.phone) && (
                  <div className="text-[12.5px] text-[var(--ink-soft)]">
                    {order.customerPhone || order.lead?.phone}
                  </div>
                )}
              </div>

              {/* Status control */}
              <div className="flex items-center gap-2">
                <span className="text-[12.5px] text-[var(--ink-soft)]">Status</span>
                <OrderStatusSelect
                  value={order.status}
                  disabled={changeStatus.isPending}
                  onChange={(status) => changeStatus.mutate({ id: order.id, status })}
                />
              </div>

              {/* Items */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">Items</div>
                <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                  {order.items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--line-soft)] last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-[var(--ink)] truncate">{it.name}</div>
                        <div className="text-[11.5px] text-[var(--ink-mute)]">
                          {it.quantity} × {formatMoney(it.unitPrice, order.currency)}
                          {it.sku ? ` · ${it.sku}` : ''}
                        </div>
                      </div>
                      <div className="text-[13px] font-medium text-[var(--ink)]">
                        {formatMoney(it.subtotal, order.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[13px]">
                <div className="flex justify-between text-[var(--ink-soft)]">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-[var(--ink-soft)] mt-1">
                  <span>Discount</span>
                  <span>− {formatMoney(order.discount, order.currency)}</span>
                </div>
                <div className="flex justify-between font-semibold text-[var(--ink)] mt-2 pt-2 border-t border-[var(--line)]">
                  <span>Total</span>
                  <span>{formatMoney(order.total, order.currency)}</span>
                </div>
              </div>

              {order.notes && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1">Notes</div>
                  <p className="text-[13px] text-[var(--ink-soft)] whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}

              {/* Status timeline */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">Timeline</div>
                <div className="flex flex-col gap-2.5">
                  {order.statusHistory.map((h) => (
                    <div key={h.id} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-[7px] flex-shrink-0" />
                      <div className="text-[12.5px]">
                        <span className="text-[var(--ink)]">
                          {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                        </span>
                        <span className="text-[var(--ink-mute)]">
                          {' '}· {new Date(h.createdAt).toLocaleString()}
                          {h.changedBySystem ? ' · AI' : ''}
                        </span>
                        {h.note && <div className="text-[11.5px] text-[var(--ink-mute)]">{h.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {order && (
          <div className="p-[18px] border-t border-[var(--line)] flex justify-between gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full">
                <span className="text-[12.5px] text-[var(--ink-soft)] flex-1">Delete this order?</span>
                <button className="btn btn-outline text-[12.5px]" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button
                  className="btn text-[12.5px] bg-[#DC2626] text-white"
                  disabled={del.isPending}
                  onClick={() => del.mutate(order.id, { onSuccess: onClose })}
                >
                  {del.isPending && <Loader2 size={13} className="animate-spin" />}
                  Delete
                </button>
              </div>
            ) : (
              <>
                <button className="btn btn-ghost text-[12.5px] text-[#DC2626]" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} /> Delete
                </button>
                <button className="btn btn-outline text-[12.5px]" onClick={() => onEdit(order)}>
                  <Pencil size={14} /> Edit
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
