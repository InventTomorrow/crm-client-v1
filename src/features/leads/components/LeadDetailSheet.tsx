"use client";
import { pkr } from "@/lib/utils";
import { useLeadOrders } from "@/features/orders/hooks/useOrders";
import { CRMAvatar } from "@/shared/ui/CRMAvatar";
import { ChannelBadge } from "@/shared/ui/ChannelBadge";
import {
  Inbox,
  Link,
  Loader2,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { Lead, STATUS_META } from "../types";
import type { OrderStatus } from "@/features/orders/types";

const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING:          '#F59E0B',
  CONFIRMED:        '#3B82F6',
  PAID:             '#8B5CF6',
  PROCESSING:       '#06B6D4',
  SHIPPED:          '#10B981',
  OUT_FOR_DELIVERY: '#10B981',
  DELIVERED:        '#16A34A',
  FULFILLED:        '#16A34A',
  COMPLETED:        '#15803D',
  CANCELLED:        '#EF4444',
  REFUNDED:         '#94A3B8',
  DRAFT:            '#94A3B8',
};

export default function LeadDetailSheet({
  lead,
  onClose,
  onEdit,
  onDelete,
  onOpenChat,
  isDeleting,
}: {
  lead: Lead | null;
  onClose: () => void;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onOpenChat: (lead: Lead) => void;
  isDeleting?: boolean;
}) {
  if (!lead) return null;
  const statusMeta = STATUS_META[lead.status] ?? STATUS_META.prospect;
  const { data: orders, isLoading: ordersLoading } = useLeadOrders(lead.id);

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className="card-2 fade-up fixed flex flex-col overflow-hidden bg-[var(--surface)] right-[14px] top-[14px] bottom-[14px] w-[420px] z-[70]">
        {/* Header */}
        <div className="relative p-[18px] border-b border-[var(--line)]">
          <button className="btn btn-ghost absolute top-2.5 right-2.5 p-1.5" onClick={onClose}>
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <CRMAvatar name={lead.name} size={52} ring />
            <div>
              <h3 className="text-[17px] font-semibold">{lead.name}</h3>
              <div className="flex gap-1.5 items-center mt-1">
                <span
                  className="badge font-medium flex items-center gap-1.5 py-[3px] px-[9px]"
                  style={{ background: statusMeta.tint, color: statusMeta.color, border: `1px solid ${statusMeta.tint}` }}
                >
                  <span className="dot w-[7px] h-[7px]" style={{ background: statusMeta.color }} />
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
          {/* Lead info */}
          <div className="flex flex-col gap-2">
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">Lead Information</p>
            <div className="card p-3 bg-[var(--surface-2)] flex flex-col gap-2 text-[12.5px]">
              {lead.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={11} className="text-[var(--ink-mute)] flex-shrink-0" />
                  <span className="text-[var(--ink-mute)]">Phone</span>
                  <span className="font-medium text-[var(--ink)] ml-auto">{lead.phone}</span>
                </div>
              )}
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail size={11} className="text-[var(--ink-mute)] flex-shrink-0" />
                  <span className="text-[var(--ink-mute)]">Email</span>
                  <span className="font-medium text-[var(--ink)] ml-auto">{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin size={11} className="text-[var(--ink-mute)] flex-shrink-0" />
                <span className="text-[var(--ink-mute)]">City</span>
                <span className="font-medium text-[var(--ink)] ml-auto">{lead.city}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { l: "Lifetime Value", v: pkr(lead.value || 0) },
              { l: "Last Active",    v: `${lead.time} ago` },
              { l: "Channel",        v: lead.channel.toUpperCase() },
            ].map((k, i) => (
              <div key={i} className="card p-[11px]">
                <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">{k.l}</div>
                <div className="font-semibold text-[17px] mt-1 text-[var(--ink)] font-[var(--font-head)]">{k.v}</div>
              </div>
            ))}
          </div>

          {/* Order history */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--ink-mute)]">Order History</p>
              {orders && orders.length > 0 && (
                <span className="badge bg-[var(--surface-2)] text-[var(--ink-mute)] border border-[var(--line)] text-[10.5px] px-[7px] py-[2px]">
                  {orders.length} order{orders.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {ordersLoading && (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-[var(--ink-mute)]" />
              </div>
            )}

            {!ordersLoading && (!orders || orders.length === 0) && (
              <div className="card p-4 bg-[var(--surface-2)] flex flex-col items-center gap-1.5 text-center">
                <Package size={18} className="text-[var(--ink-mute)]" />
                <p className="text-[12px] text-[var(--ink-mute)]">No orders yet</p>
              </div>
            )}

            {orders && orders.length > 0 && (
              <div className="flex flex-col gap-2">
                {orders.map((order) => {
                  const color = ORDER_STATUS_COLOR[order.status] ?? '#94A3B8';
                  return (
                    <div key={order.id} className="card p-3 bg-[var(--surface-2)] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-semibold text-[var(--ink)]">
                          Order #{order.orderNumber}
                        </span>
                        <span
                          className="badge text-[10.5px] font-medium px-[7px] py-[2px]"
                          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
                        >
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase().replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11.5px] text-[var(--ink-mute)]">
                        <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        <span className="font-semibold text-[var(--ink)]">{order.currency} {order.total}</span>
                      </div>
                      <div className="text-[11px] text-[var(--ink-mute)]">
                        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 p-3.5 border-t border-[var(--line)]">
          <div className="flex gap-2">
            <button className="btn btn-outline flex-1 justify-center" onClick={() => onOpenChat(lead)}>
              <Inbox size={14} /> Open Chat
            </button>
            <button className="btn btn-outline flex-1 justify-center" onClick={() => onEdit(lead)}>
              <Pencil size={14} /> Edit
            </button>
            <button
              className="btn btn-outline justify-center text-[#DC2626] border-[#FECACA] hover:bg-[#FEF2F2]"
              onClick={() => onDelete(lead)}
              disabled={isDeleting}
              title="Delete lead"
            >
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            </button>
          </div>
          <button className="btn btn-grad w-full justify-center">
            <Link size={14} /> Generate Checkout
          </button>
        </div>
      </div>
    </>
  );
}
