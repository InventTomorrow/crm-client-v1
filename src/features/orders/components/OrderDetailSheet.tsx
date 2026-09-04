"use client";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import { Label } from "@/shared/ui/Label";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { ShimmerImage } from "@/shared/ui/ShimmerImage";
import { Check, Copy, Loader2, MapPin, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  useDeleteOrder,
  useOrder,
  useUpdateOrderStatus,
} from "../hooks/useOrders";
import { ORDER_STATUS_META, formatMoney } from "../lib/format";
import type { Order, OrderStatus } from "../types";
import { ImagePreviewDialog } from "./ImagePreviewDialog";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderStatusSelect } from "./OrderStatusSelect";

interface PreviewImage {
  url: string;
  caption: string;
  filenameBase: string;
}

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
  const [shippingCopied, setShippingCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null);

  const copyShippingDetails = (
    shipping: NonNullable<Order["shippingDetail"]>,
  ) => {
    const lines = [
      `Name: ${shipping.customerName}`,
      `Contact: ${shipping.customerPhone}`,
      shipping.email && `Email: ${shipping.email}`,
      `Address: ${shipping.addressLine1}`,
      shipping.addressLine2 && `Address 2: ${shipping.addressLine2}`,
      [shipping.city, shipping.state, shipping.postalCode].filter(Boolean)
        .length &&
        `City: ${[shipping.city, shipping.state, shipping.postalCode].filter(Boolean).join(", ")}`,
      `Country: ${shipping.country}`,
      shipping.notes && `Notes: ${shipping.notes}`,
    ].filter(Boolean);
    navigator.clipboard.writeText(lines.join("\n"));
    setShippingCopied(true);
    setTimeout(() => setShippingCopied(false), 2000);
  };

  const resetStatusChange = () => {
    setPendingStatus(null);
    setNotifyCustomer(true);
  };

  // When any line is customized, order.notes reads as the customer's brief
  // for that work — it belongs next to the customization, not as an
  // easy-to-miss section at the bottom.
  const anyItemCustomized =
    order?.items.some(
      (i) => !!i.customOptions?.length || !!i.customizationNote,
    ) ?? false;

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

              {/* Held until the team prices the custom work on it. */}
              {order.quoteStatus === "PENDING" && (
                <div className="rounded-xl border border-[var(--warning-line,var(--line))] bg-[var(--surface-2)] p-3">
                  <div className="text-[13px] font-medium text-[var(--ink)]">
                    Waiting on your price
                  </div>
                  <p className="mt-1 text-[11.5px] text-[var(--ink-mute)]">
                    This order includes custom work your team prices by hand. It
                    stays a draft — no stock is held and the customer has not
                    been charged — until you set the line prices and confirm it.
                  </p>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">
                  Items
                </div>
                <div className="rounded-xl border border-[var(--line)] overflow-hidden">
                  {order.items.map((orderItem) => {
                    // Click-through to the catalog: filter by name and ring the
                    // exact product when we know its id.
                    const params = new URLSearchParams({ q: orderItem.name });
                    if (orderItem.productId)
                      params.set("highlight", orderItem.productId);
                    const hasCustomization =
                      !!orderItem.customOptions?.length ||
                      !!orderItem.customizationNote;
                    return (
                      <div
                        key={orderItem.id}
                        className="border-b border-[var(--line-soft)] last:border-0"
                      >
                        <div className="flex items-start gap-2.5 px-3 py-2.5">
                          {orderItem.imageUrl && (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: orderItem.imageUrl!,
                                  caption: orderItem.name,
                                  filenameBase: orderItem.name,
                                })
                              }
                              className="flex-shrink-0 rounded-lg transition-opacity hover:opacity-80"
                              title="View full size"
                            >
                              <ShimmerImage
                                src={getImageUrl(orderItem.imageUrl)}
                                alt={orderItem.name}
                                wrapperClassName="w-11 h-11 rounded-lg border border-[var(--line)] bg-[var(--surface-2)]"
                                className="w-full h-full object-cover"
                              />
                            </button>
                          )}
                          <Link
                            href={`/inventory?${params.toString()}`}
                            className="group hover-shimmer min-w-0 flex-1 flex items-start justify-between gap-2 no-underline"
                            title="View in inventory"
                          >
                            <div className="min-w-0">
                              <div className="text-[13px] text-[var(--ink)] truncate group-hover:text-[var(--accent)]">
                                {orderItem?.name}
                              </div>
                              <div className="text-[11.5px] text-[var(--ink-mute)]">
                                {orderItem?.quantity} ×{" "}
                                {formatMoney(
                                  orderItem?.unitPrice,
                                  order?.currency,
                                )}
                                {orderItem?.sku ? ` · ${orderItem?.sku}` : ""}
                              </div>
                            </div>
                            <div className="text-[13px] font-medium text-[var(--ink)] flex-shrink-0">
                              {formatMoney(
                                orderItem?.subtotal,
                                order?.currency,
                              )}
                            </div>
                          </Link>
                        </div>

                        {hasCustomization && (
                          <div className="mx-3 mb-2.5 rounded-lg border border-[var(--warning-line,var(--line))] bg-[var(--surface-2)] p-2.5">
                            <div className="text-[10.5px] uppercase tracking-wide text-[var(--ink-mute)] mb-1.5">
                              Customization Requested
                            </div>
                            {orderItem.customOptions?.length ? (
                              <ul className="flex flex-col gap-1.5">
                                {orderItem.customOptions.map((option) => {
                                  // Redelivered media or a resent photo can leave
                                  // duplicate URLs on the same option — one photo
                                  // should never appear as three identical thumbnails.
                                  const artworkUrls = [
                                    ...new Set(option.imageUrls ?? []),
                                  ];
                                  return (
                                    <li
                                      key={option.key}
                                      className="flex items-start gap-1.5 text-[11.5px] text-[var(--ink-soft)]"
                                    >
                                      {artworkUrls.length ? (
                                        <span className="flex flex-shrink-0 gap-1">
                                          {artworkUrls.map((url) => (
                                            <button
                                              key={url}
                                              type="button"
                                              onClick={() =>
                                                setPreviewImage({
                                                  url,
                                                  caption: `${orderItem.name} — ${option.label}`,
                                                  filenameBase: `${orderItem.name}-${option.label}`,
                                                })
                                              }
                                              className="transition-opacity hover:opacity-80"
                                              title="View full size"
                                            >
                                              <ShimmerImage
                                                src={getImageUrl(url)}
                                                alt={`${option.label} artwork`}
                                                wrapperClassName="w-9 h-9 rounded border border-[var(--line)] bg-[var(--surface)] flex-shrink-0"
                                                className="w-full h-full object-contain"
                                              />
                                            </button>
                                          ))}
                                        </span>
                                      ) : null}
                                      <span className="min-w-0">
                                        <span className="text-[var(--ink-mute)]">
                                          {option.label}:
                                        </span>{" "}
                                        {option.value}
                                        {option.requiresQuote
                                          ? " · priced by team"
                                          : option.priceDelta
                                            ? ` · +${formatMoney(option.priceDelta, order?.currency)}`
                                            : ""}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            ) : null}
                            {orderItem.customizationNote && (
                              <div
                                className={
                                  orderItem.customOptions?.length
                                    ? "mt-1.5 pt-1.5 border-t border-[var(--line)] text-[11.5px] text-[var(--ink-soft)]"
                                    : "text-[11.5px] text-[var(--ink-soft)]"
                                }
                              >
                                <span className="text-[var(--ink-mute)]">
                                  Team note:
                                </span>{" "}
                                {orderItem.customizationNote}
                              </div>
                            )}
                            {order.notes && (
                              <div
                                className={
                                  orderItem.customOptions?.length ||
                                  orderItem.customizationNote
                                    ? "mt-1.5 pt-1.5 border-t border-[var(--line)] text-[11.5px] text-[var(--ink-soft)] whitespace-pre-wrap"
                                    : "text-[11.5px] text-[var(--ink-soft)] whitespace-pre-wrap"
                                }
                              >
                                <span className="text-[var(--ink-mute)]">
                                  Customer note:
                                </span>{" "}
                                {order.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

              {/* Delivery address — shown last, after pricing */}
              {order.shippingDetail && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-1.5">
                    <div className="text-[11px] uppercase tracking-wide text-[var(--ink-mute)] flex items-center gap-1.5">
                      <MapPin size={12} /> Shipping Details
                    </div>
                    <button
                      type="button"
                      onClick={() => copyShippingDetails(order.shippingDetail!)}
                      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                    >
                      {shippingCopied ? (
                        <>
                          <Check size={12} className="text-[#15803D]" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-2)] p-3 text-[13px] flex flex-col gap-1.5">
                    {[
                      {
                        label: "Name",
                        value: order.shippingDetail.customerName,
                      },
                      {
                        label: "Contact",
                        value: order.shippingDetail.customerPhone,
                      },
                      { label: "Email", value: order.shippingDetail.email },
                      {
                        label: "Address",
                        value: order.shippingDetail.addressLine1,
                      },
                      {
                        label: "Address 2",
                        value: order.shippingDetail.addressLine2,
                      },
                      {
                        label: "City",
                        value: [
                          order.shippingDetail.city,
                          order.shippingDetail.state,
                          order.shippingDetail.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", "),
                      },
                      { label: "Country", value: order.shippingDetail.country },
                      { label: "Notes", value: order.shippingDetail.notes },
                    ]
                      .filter((field) => field.value)
                      .map((field) => (
                        <div
                          key={field.label}
                          className="flex items-start gap-2"
                        >
                          <span className="w-[62px] flex-shrink-0 text-[11.5px] text-[var(--ink-mute)]">
                            {field.label}
                          </span>
                          <span className="min-w-0 text-[var(--ink-soft)]">
                            {field.value}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Shown here only when no line is customized — otherwise this
                  same note already appears inside the Customization Requested
                  card above. */}
              {!anyItemCustomized && order.notes && (
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

      <ImagePreviewDialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage?.url ?? null}
        caption={previewImage?.caption ?? ""}
        filenameBase={previewImage?.filenameBase ?? "image"}
      />
    </>
  );
}
