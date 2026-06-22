"use client";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useCreateOrder,
  useOrders,
  useOrdersSummary,
  useUpdateOrder,
} from "../hooks/useOrders";
import { ORDER_STATUS_META, formatMoney } from "../lib/format";
import {
  ORDER_STATUS_OPTIONS,
  type Order,
  type OrderFilters,
  type OrderListItem,
  type OrderStatus,
} from "../types";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrderForm } from "./OrderForm";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrdersView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const filters: OrderFilters = useMemo(
    () => ({ ...(search ? { search } : {}), ...(status ? { status } : {}) }),
    [search, status],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useOrders(filters);
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

  const columns: ColumnDef<OrderListItem, unknown>[] = useMemo(
    () => [
      {
        id: "orderNumber",
        accessorFn: (o) => o.orderNumber,
        header: "Order",
        enableSorting: true,
        size: 90,
        cell: ({ row }) => (
          <span className="text-[13px] font-semibold text-[var(--ink)]">
            #{row.original.orderNumber}
          </span>
        ),
      },
      {
        id: "customer",
        accessorFn: (o) => o.customerName || o.lead?.name || "",
        header: "Customer",
        enableSorting: true,
        cell: ({ row }) => {
          const o = row.original;
          return (
            <div className="min-w-0">
              <div className="text-[13px] text-[var(--ink)] truncate font-medium">
                {o.customerName || o.lead?.name || "Unknown"}
              </div>
              {o.lead?.phone && (
                <div className="text-[11.5px] text-[var(--ink-mute)]">
                  {o.lead.phone}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "items",
        accessorFn: (o) => o.items.length,
        header: "Items",
        enableSorting: true,
        size: 70,
        cell: ({ row }) => (
          <span className="text-[13px] text-[var(--ink-soft)]">
            {row.original.items.length}
          </span>
        ),
      },
      {
        id: "total",
        accessorFn: (o) => o.total,
        header: "Total",
        enableSorting: true,
        size: 120,
        cell: ({ row }) => (
          <span className="text-[13px] font-medium text-[var(--ink)] font-[var(--font-mono)]">
            {formatMoney(row.original.total, row.original.currency)}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (o) => o.status,
        header: "Status",
        enableSorting: true,
        size: 140,
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
      },
      {
        id: "createdAt",
        accessorFn: (o) => new Date(o.createdAt).getTime(),
        header: "Date",
        enableSorting: true,
        size: 110,
        cell: ({ row }) => (
          <span className="text-[12px] text-[var(--ink-mute)]">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  const handleExport = (rows: OrderListItem[]) => {
    const csv = [
      ["Order", "Customer", "Items", "Total", "Status", "Date"].join(","),
      ...rows.map((o) =>
        [
          `#${o.orderNumber}`,
          `"${o.customerName || o.lead?.name || "Unknown"}"`,
          o.items.length,
          o.total,
          o.status,
          new Date(o.createdAt).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] font-semibold text-[var(--ink)]">
            Orders
          </h1>
          <p className="text-[13px] text-[var(--ink-mute)] mt-0.5">
            {summary
              ? `${summary.total} orders · ${formatMoney(summary.revenue ?? 0)} revenue`
              : "Manage your orders"}
          </p>
        </div>
        <PermissionGuard permission="orders:create">
          <button className="btn btn-grad" onClick={openCreate}>
            <Plus size={15} /> New order
          </button>
        </PermissionGuard>
      </div>

      {/* Summary cards */}
      {summary && summary.byStatus.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {summary.byStatus.slice(0, 4).map((s) => (
            <div
              key={s.status}
              className={`card p-3.5 cursor-pointer transition-colors ${status === s.status ? "border-[var(--accent)] bg-[var(--accent-soft)]" : "hover:bg-[var(--surface-2)]"}`}
              onClick={() => setStatus(status === s.status ? "" : s.status)}
            >
              <div className="text-[12px] text-[var(--ink-mute)]">
                {ORDER_STATUS_META[s.status].label}
              </div>
              <div className="text-[20px] font-semibold text-[var(--ink)] mt-0.5">
                {s.count}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DataTable with toolbar */}
      <DataTable
        data={orders as OrderListItem[]}
        columns={columns}
        isLoading={isLoading}
        selectable
        onRowClick={(o) => setSelectedId(o.id)}
        onExport={handleExport}
        emptyMessage="No orders yet."
        defaultPageSize={20}
        toolbar={
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-[340px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
              />
              <input
                className="input pl-8 text-[13px]"
                placeholder="Search by order #, customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input w-[160px] text-[13px]"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
            >
              <option value="">All statuses</option>
              {ORDER_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {ORDER_STATUS_META[s].label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Load more for infinite scroll */}
      {hasNextPage && (
        <div className="flex justify-center mt-3">
          <button
            className="btn btn-outline text-[12.5px]"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load more
          </button>
        </div>
      )}

      {selectedId && (
        <OrderDetailSheet
          orderId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={openEdit}
        />
      )}

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
