"use client";
import { Button } from "@/shared/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import {
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { OrderListItem } from "../types";

interface OrderRowActionsProps {
  order: OrderListItem;
  onEdit: (order: OrderListItem) => void;
  onDelete: (order: OrderListItem) => void;
  /** Opens the inbox on the customer who placed this order. */
  onOpenCustomerChat: (order: OrderListItem) => void;
  /** True while this order's customer is being verified on WhatsApp. */
  isOpeningChat: boolean;
  /** Any row is verifying — one at a time, so the rest stay disabled meanwhile. */
  isAnyChatOpening: boolean;
}

/** Per-row actions for the orders table — open the customer's chat, plus the ⋯ menu. */
export function OrderRowActions({
  order,
  onEdit,
  onDelete,
  onOpenCustomerChat,
  isOpeningChat,
  isAnyChatOpening,
}: OrderRowActionsProps) {
  const customerName =
    order.customerName || order.lead?.name || "this customer";

  return (
    <div className="flex items-center gap-0.5">
      {/* Orders imported without a lead have no conversation to open. */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Open chat with ${customerName}`}
        title={
          order.lead
            ? `Open chat with ${customerName}`
            : "No customer chat linked to this order"
        }
        disabled={!order.lead || isAnyChatOpening}
        onClick={(e) => {
          e.stopPropagation();
          onOpenCustomerChat(order);
        }}
      >
        {isOpeningChat ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <MessageSquare size={16} />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Actions for order #${order.orderNumber}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <PermissionGuard permission="orders:edit">
            <DropdownMenuItem onSelect={() => onEdit(order)}>
              <Pencil size={14} /> Edit
            </DropdownMenuItem>
          </PermissionGuard>
          <PermissionGuard permission="orders:cancel">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => onDelete(order)}
            >
              <Trash2 size={14} /> Delete
            </DropdownMenuItem>
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
