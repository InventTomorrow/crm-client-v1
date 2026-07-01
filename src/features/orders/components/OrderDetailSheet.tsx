"use client";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { Label } from "@/shared/ui/Label";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { Loader2, MapPin, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import {
  useDeleteOrder,
  useOrder,
  useUpdateOrderStatus,
} from "../hooks/useOrders";
import { ORDER_STATUS_META, formatMoney } from "../lib/format";
import type { Order, OrderStatus } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusSelect } from "./OrderStatusSelect";

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
  // Status changes are staged locally and only sent to the API once the user
  // reviews the change and clicks Save. The checkbox toggles customer notify.
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [notifyCustomer, setNotifyCustomer] = useState(true);

  const resetStatusChange = () => {
    setPendingStatus(null);
    setNotifyCustomer(true);
  };

  const saveStatusChange = () => {
    if (!order || !pendingStatus) return;
    changeStatus.mutate(
      { id: order.id, status: pendingStatus, notifyCustomer },
      { onSuccess: resetStatusChange },
    );
  };

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[460px] max-w-[calc(100vw-28px)] z-[70]">
        <div className="flex items-center justify-between p-[18px] border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <h3 className="text-[16px] font-semibold text-[var(--ink)]">
              {order ? `Order #${order.orderNumber}` : "Order"}
            </h3>
            {order && <OrderStatusBadge status={order.status} />}
          </div>
          <div className="flex items-center gap-1.5">
            {order && (
              <PermissionGuard permission="orders:edit">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(order)}
                >
                  <Pencil size={14} /> Edit
                </Button>
              </PermissionGuard>
            )}
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
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
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1">
                  Customer
                </div>
                <div className="text-[14px] font-medium text-[var(--ink)]">
                  {order.customerName || order.lead?.name || "Unknown"}
                </div>
                {(order.customerPhone || order.lead?.phone) && (
                  <div className="text-[12.5px] text-[var(--ink-soft)]">
                    {order.customerPhone || order.lead?.phone}
                  </div>
                )}
              </div>

              {/* Status control — staged, confirmed before saving */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] text-[var(--ink-soft)]">
                    Status
                  </span>
                  <OrderStatusSelect
                    value={pendingStatus ?? order.status}
                    disabled={changeStatus.isPending}
                    onChange={(status) => {
                      setNotifyCustomer(true);
                      setPendingStatus(status === order.status ? null : status);
                    }}
                  />
                </div>

                {pendingStatus && pendingStatus !== order.status && (
                  <div className="rounded-xl border border-[var(--accent)] bg-[var(--accent-soft)] p-3 flex flex-col gap-3">
                    <p className="text-[12.5px] text-[var(--ink-soft)] leading-snug">
                      Change status from{" "}
                      <span className="font-medium text-[var(--ink)]">
                        {ORDER_STATUS_META[order.status]?.label ?? order.status}
                      </span>{" "}
                      to{" "}
                      <span className="font-medium text-[var(--ink)]">
                        {ORDER_STATUS_META[pendingStatus]?.label}
                      </span>
                      .
                    </p>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="order-notify-customer"
                        checked={notifyCustomer}
                        onCheckedChange={(v) => setNotifyCustomer(v === true)}
                        className="flex-shrink-0"
                      />
                      <Label
                        htmlFor="order-notify-customer"
                        className="text-[12.5px] font-normal text-[var(--ink-soft)] cursor-pointer"
                      >
                        Notify the customer on WhatsApp
                      </Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetStatusChange}
                        disabled={changeStatus.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveStatusChange}
                        disabled={changeStatus.isPending}
                      >
                        {changeStatus.isPending && (
                          <Loader2 size={13} className="animate-spin" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Items */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">
                  Items
                </div>
                <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                  {order.items.map((orderItem) => (
                    <div
                      key={orderItem.id}
                      className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--line-soft)] last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] text-[var(--ink)] truncate">
                          {orderItem?.name}
                        </div>
                        <div className="text-[11.5px] text-[var(--ink-mute)]">
                          {orderItem?.quantity} ×{" "}
                          {formatMoney(orderItem?.unitPrice, order?.currency)}
                          {orderItem?.sku ? ` · ${orderItem?.sku}` : ""}
                        </div>
                      </div>
                      <div className="text-[13px] font-medium text-[var(--ink)]">
                        {formatMoney(orderItem?.subtotal, order?.currency)}
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

              {/* Delivery address */}
              {order.shippingDetail && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5 flex items-center gap-1.5">
                    <MapPin size={12} /> Delivery Address
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[13px] text-[var(--ink-soft)] flex flex-col gap-0.5">
                    <span className="font-medium text-[var(--ink)]">
                      {order.shippingDetail.customerName}
                    </span>
                    {order.shippingDetail.customerPhone && (
                      <span>{order.shippingDetail.customerPhone}</span>
                    )}
                    <span>{order.shippingDetail.addressLine1}</span>
                    {order.shippingDetail.addressLine2 && (
                      <span>{order.shippingDetail.addressLine2}</span>
                    )}
                    <span>
                      {[
                        order.shippingDetail.city,
                        order.shippingDetail.state,
                        order.shippingDetail.postalCode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                    <span>{order.shippingDetail.country}</span>
                    {order.shippingDetail.notes && (
                      <span className="text-[11.5px] text-[var(--ink-mute)] mt-1">
                        {order.shippingDetail.notes}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {order.notes && (
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1">
                    Notes
                  </div>
                  <p className="text-[13px] text-[var(--ink-soft)] whitespace-pre-wrap">
                    {order.notes}
                  </p>
                </div>
              )}

              {order.status === "CANCELLED" && order.cancellationReason && (
                <div className="rounded-md bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.15)] px-3 py-2.5">
                  <div className="text-[11px] uppercase tracking-wide text-[rgba(239,68,68,0.7)] mb-1">
                    Cancellation Reason
                  </div>
                  <p className="text-[13px] text-[var(--ink-soft)] whitespace-pre-wrap">
                    {order.cancellationReason}
                  </p>
                </div>
              )}

              {/* Status timeline */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">
                  Timeline
                </div>
                <div className="flex flex-col gap-2.5">
                  {order.statusHistory.map((h) => (
                    <div key={h.id} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-[7px] flex-shrink-0" />
                      <div className="text-[12.5px]">
                        <span className="text-[var(--ink)]">
                          {h.fromStatus
                            ? `${h.fromStatus} → ${h.toStatus}`
                            : h.toStatus}
                        </span>
                        <span className="text-[var(--ink-mute)]">
                          {" "}
                          · {new Date(h.createdAt).toLocaleString()}
                          {h.changedBySystem ? " · AI" : ""}
                        </span>
                        {h.note && (
                          <div className="text-[11.5px] text-[var(--ink-mute)]">
                            {h.note}
                          </div>
                        )}
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
                <span className="text-[12.5px] text-[var(--ink-soft)] flex-1">
                  Delete this order?
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={del.isPending}
                  onClick={() => del.mutate(order.id, { onSuccess: onClose })}
                >
                  {del.isPending && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  Delete
                </Button>
              </div>
            ) : (
              <PermissionGuard permission="orders:cancel">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} /> Delete
                </Button>
              </PermissionGuard>
            )}
          </div>
        )}
      </div>
    </>
  );
}
