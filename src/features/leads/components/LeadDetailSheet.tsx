"use client";
import { useGenerateCheckout, useSendReceipt } from "@/features/checkout/hooks";
import { useLeadOrders } from "@/features/orders/hooks/useOrders";
import { formatDateTime } from "@/lib/date";
import { pkr } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import { Checkbox } from "@/shared/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import {
  Archive,
  ArchiveRestore,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Send,
  Trash2,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Lead } from "../types";
import { useLeadVocabulary } from "../utils/leadVocabulary";

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#3B82F6",
  PAID: "#8B5CF6",
  PROCESSING: "#06B6D4",
  SHIPPED: "#10B981",
  OUT_FOR_DELIVERY: "#10B981",
  DELIVERED: "#16A34A",
  FULFILLED: "#16A34A",
  COMPLETED: "#15803D",
  CANCELLED: "#EF4444",
  REFUNDED: "#94A3B8",
  DRAFT: "#94A3B8",
};

export default function LeadDetailSheet({
  lead,
  archived = false,
  onClose,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onOpenChat,
  isOpeningChat = false,
  isDeleting,
}: {
  lead: Lead | null;
  archived?: boolean;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onArchive: (lead: Lead) => void;
  onRestore: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onOpenChat: (lead: Lead) => void | Promise<void>;
  /** True while the lead's WhatsApp number is being verified — spinner stays until navigation. */
  isOpeningChat?: boolean;
  isDeleting?: boolean;
}) {
  // All hooks must run before the early return below — call them unconditionally.
  const vocabulary = useLeadVocabulary();
  const { data: orders, isLoading: ordersLoading } = useLeadOrders(lead?.id);
  const generateCheckout = useGenerateCheckout();
  const sendReceipt = useSendReceipt();
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [channels, setChannels] = useState({ whatsapp: true, email: true });
  // Actions target the lead's most recent order (list is newest-first).
  const latestOrder = orders?.[0] ?? null;

  const handleGenerateCheckout = () => {
    if (!latestOrder) return;
    generateCheckout.mutate(latestOrder.id, {
      onSuccess: async ({ checkoutUrl }) => {
        try {
          await navigator.clipboard?.writeText(checkoutUrl);
          toast.success("Checkout link copied to clipboard");
        } catch {
          toast.success("Checkout link ready", { description: checkoutUrl });
        }
      },
    });
  };

  const handleSendReceipt = () => {
    if (!latestOrder) return;
    if (!channels.whatsapp && !channels.email) {
      toast.error("Pick at least one channel");
      return;
    }
    sendReceipt.mutate(
      { orderId: latestOrder.id, channels },
      {
        onSuccess: (res) => {
          const parts: string[] = [];
          if (channels.whatsapp)
            parts.push(
              res.whatsapp === "sent"
                ? "WhatsApp ✓"
                : `WhatsApp: ${res.whatsapp.replace(/_/g, " ")}`,
            );
          if (channels.email)
            parts.push(
              res.email === "sent"
                ? "Email ✓"
                : `Email: ${res.email.replace(/_/g, " ")}`,
            );
          toast.success(`Receipt sent — ${parts.join(", ")}`);
          setReceiptOpen(false);
        },
      },
    );
  };

  if (!lead) return null;
  const statusMeta =
    vocabulary.statusMeta[lead.status] ?? vocabulary.statusMeta.prospect;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[420px] z-[70]">
        {/* Header */}
        <div className="relative p-[18px] border-b border-[var(--line)]">
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2.5 right-2.5"
            onClick={onClose}
          >
            <X size={18} />
          </Button>
          <div className="flex items-center gap-3">
            <CRMAvatar name={lead.name} size={52} ring />
            <div>
              <h3 className="text-[17px] font-semibold">{lead.name}</h3>
              <div className="flex gap-1.5 items-center mt-1">
                <span
                  className="badge font-medium flex items-center gap-1.5 py-[3px] px-[9px]"
                  style={{
                    background: statusMeta.tint,
                    color: statusMeta.color,
                    border: `1px solid ${statusMeta.tint}`,
                  }}
                >
                  <span
                    className="dot w-[7px] h-[7px]"
                    style={{ background: statusMeta.color }}
                  />
                  {statusMeta.label}
                </span>
                <ChannelBadge channel={lead.channel} />
              </div>
              <div className="text-[11.5px] mt-1 flex items-center gap-1 text-[var(--ink-mute)]">
                <MapPin size={11} /> {lead.city}, Pakistan
              </div>
            </div>
          </div>
        </div>

        <div className="scroll flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* Contact info */}
          <div className="flex flex-col gap-2">
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
              {vocabulary.singularTitle} information
            </p>
            <div className="card p-3 bg-[var(--surface-2)] flex flex-col gap-2 text-[12.5px]">
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone
                    size={11}
                    className="text-[var(--ink-mute)] flex-shrink-0"
                  />
                  <span className="text-[var(--ink-mute)]">Phone</span>
                  <span className="font-medium text-[var(--ink)] ml-auto">
                    {lead.phone}
                  </span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail
                    size={11}
                    className="text-[var(--ink-mute)] flex-shrink-0"
                  />
                  <span className="text-[var(--ink-mute)]">Email</span>
                  <span className="font-medium text-[var(--ink)] ml-auto">
                    {lead.email}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin
                  size={11}
                  className="text-[var(--ink-mute)] flex-shrink-0"
                />
                <span className="text-[var(--ink-mute)]">City</span>
                <span className="font-medium text-[var(--ink)] ml-auto">
                  {lead.city}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Lifetime Value", value: pkr(lead.value || 0) },
              { label: "Channel", value: lead.channel.toUpperCase() },
              {
                label: "Joined",
                value: formatDateTime(lead.createdAt),
                compact: true,
              },
              {
                label: "Last Activity",
                value: formatDateTime(lead.lastContactedAt, "Never contacted"),
                compact: true,
              },
            ].map((stat) => (
              <div key={stat.label} className="card p-[11px]">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                  {stat.label}
                </div>
                <div
                  className={`font-semibold mt-1 text-[var(--ink)] font-[var(--font-head)] ${
                    stat.compact ? "text-[13px]" : "text-[17px]"
                  }`}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Order history */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">
                Order History
              </p>
              {orders && orders.length > 0 && (
                <span className="badge bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)] text-[10.5px] px-[7px] py-[2px]">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {ordersLoading && (
              <div className="flex justify-center py-4">
                <Loader2
                  size={16}
                  className="animate-spin text-[var(--ink-mute)]"
                />
              </div>
            )}

            {!ordersLoading && (!orders || orders.length === 0) && (
              <div className="card p-4 bg-[var(--surface-2)] flex flex-col items-center gap-1.5 text-center">
                <Package size={18} className="text-[var(--ink-mute)]" />
                <p className="text-[12px] text-[var(--ink-mute)]">
                  No orders yet
                </p>
              </div>
            )}

            {orders && orders.length > 0 && (
              <div className="flex flex-col gap-2">
                {orders.map((order) => {
                  const color = ORDER_STATUS_COLOR[order.status] ?? "#94A3B8";
                  return (
                    <NextLink
                      key={order.id}
                      href={`/orders?order=${order.id}`}
                      className="card hover-shimmer p-3 bg-[var(--surface-2)] flex flex-col gap-1.5 no-underline transition-colors hover:bg-[var(--surface)] hover:border-[var(--accent)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                          Order #{order.orderNumber}
                        </span>
                        <span
                          className="badge text-[10.5px] font-medium px-[7px] py-[2px]"
                          style={{
                            color,
                            background: `${color}15`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {order.status.charAt(0) +
                            order.status
                              .slice(1)
                              .toLowerCase()
                              .replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-mute)]">
                        <span>
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </span>
                        <span className="font-semibold text-[var(--ink)]">
                          {order.currency} {order.total}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--ink-mute)]">
                        {new Date(order.createdAt).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </NextLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 p-3.5 border-t border-[var(--line)]">
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 justify-center"
              disabled={isOpeningChat}
              onClick={() => onOpenChat(lead)}
            >
              {isOpeningChat ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Inbox size={14} />
              )}{" "}
              {isOpeningChat ? "Opening…" : "Open Chat"}
            </Button>
            <PermissionGuard permission="leads:edit">
              <Button
                variant="outline"
                className="flex-1 justify-center"
                onClick={() => onEdit(lead)}
              >
                <Pencil size={14} /> Edit
              </Button>
            </PermissionGuard>
            <PermissionGuard permission="leads:delete">
              {archived ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onRestore(lead)}
                  title={`Restore ${vocabulary.singular}`}
                >
                  <ArchiveRestore size={14} />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onArchive(lead)}
                  title={`Archive ${vocabulary.singular}`}
                >
                  <Archive size={14} />
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => onDelete(lead)}
                disabled={isDeleting}
                title="Delete permanently"
              >
                {isDeleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </Button>
            </PermissionGuard>
          </div>
          {/* <div className="flex gap-2">
            <Button
              className="flex-1 justify-center"
              disabled={!latestOrder || generateCheckout.isPending}
              title={
                latestOrder ? undefined : "No order to check out yet"
              }
              onClick={handleGenerateCheckout}
            >
              {generateCheckout.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Link size={14} />
              )}{" "}
              Generate Checkout
            </Button>
            <Button
              variant="outline"
              className="flex-1 justify-center"
              disabled={!latestOrder}
              title={latestOrder ? undefined : "No order to receipt yet"}
              onClick={() => setReceiptOpen(true)}
            >
              <Receipt size={14} /> Receipt
            </Button>
          </div> */}
        </div>
      </div>

      {/* Receipt send dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-semibold">
              Send receipt
            </DialogTitle>
            <DialogDescription className="text-[12.5px] text-[var(--ink-mute)]">
              {latestOrder
                ? `Order #${latestOrder.orderNumber} · ${latestOrder.currency} ${latestOrder.total}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 py-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px]">
              <Checkbox
                checked={channels.whatsapp}
                onCheckedChange={(v) =>
                  setChannels((c) => ({ ...c, whatsapp: v === true }))
                }
              />
              WhatsApp
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer text-[13px]">
              <Checkbox
                checked={channels.email}
                onCheckedChange={(v) =>
                  setChannels((c) => ({ ...c, email: v === true }))
                }
              />
              Email
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => setReceiptOpen(false)}
              disabled={sendReceipt.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReceipt}
              disabled={
                sendReceipt.isPending || (!channels.whatsapp && !channels.email)
              }
            >
              {sendReceipt.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}{" "}
              Send receipt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
