"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { OrderListItem } from "../types";

interface OrderRowActionsProps {
  order: OrderListItem;
  onEdit: (order: OrderListItem) => void;
  onDelete: (order: OrderListItem) => void;
}

/** Per-row ⋯ menu for the orders table — Edit / Delete, gated by permission. */
export function OrderRowActions({ order, onEdit, onDelete }: OrderRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for order #${order.orderNumber}`}
          className="btn btn-ghost p-1.5 text-[var(--ink-mute)]"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <PermissionGuard permission="orders:edit">
          <DropdownMenuItem onSelect={() => onEdit(order)}>
            <Pencil size={14} /> Edit
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard permission="orders:cancel">
          <DropdownMenuItem variant="destructive" onSelect={() => onDelete(order)}>
            <Trash2 size={14} /> Delete
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
