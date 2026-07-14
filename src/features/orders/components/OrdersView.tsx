"use client";
import { extractErrorMessage } from "@/lib/utils";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import { ExportDialog } from "@/shared/ui/ExportDialog";
import { Input } from "@/shared/ui/Input";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { StatCard } from "@/shared/ui/StatCard";
import { Loader2, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useCreateOrder,
  useDeleteOrder,
  useOrders,
  useOrdersSummary,
  useUpdateOrder,
} from "../hooks/useOrders";
import { ORDER_STATUS_META, formatMoney } from "../lib/format";
import { getOrder } from "../services/ordersService";
import {
  ORDER_STATUS_OPTIONS,
  type Order,
  type OrderFilters,
  type OrderListItem,
  type OrderStatus,
} from "../types";
import { downloadOrdersCsv } from "../utils/exportOrdersCsv";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrderForm } from "./OrderForm";
import { OrderPlatformBadge } from "./OrderPlatformBadge";
import { OrderRowActions } from "./OrderRowActions";
import { OrderStatusBadge } from "./OrderStatusBadge";

export function OrdersView() {
  const [search, setSearch] = useUrlState("q");
  const [statusParam, setStatus] = useUrlState("status");
  const status = statusParam as OrderStatus | "";
  const [selectedId, setSelectedId] = useUrlState("order");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);

  const filters: OrderFilters = useMemo(
    () => ({ ...(search ? { search } : {}), ...(status ? { status } : {}) }),
    [search, status],
  );

  const [orderPendingDeletion, setOrderPendingDeletion] =
    useState<OrderListItem | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<OrderListItem[]>(
    [],
  );
  const [exportRows, setExportRows] = useState<OrderListItem[]>([]);
  const [exportOpen, setExportOpen] = useState(false);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useOrders(filters);
  const { data: summary } = useOrdersSummary();
  const createOrder = useCreateOrder();
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const orders = useMemo(() => data?.pages.flat() ?? [], [data]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = useCallback(
    (order: Order) => {
      setSelectedId("");
      setEditing(order);
      setFormOpen(true);
    },
    [setSelectedId],
  );

  const loadAndEditOrder = useCallback(
    async (listItem: OrderListItem) => {
      try {
        openEdit(await getOrder(listItem.id));
      } catch (error) {
        toast.error(extractErrorMessage(error, "Failed to load order"));
      }
    },
    [openEdit],
  );

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
        id: "platform",
        accessorFn: (o) => o.platform,
        header: "Source",
        enableSorting: true,
        size: 160,
        cell: ({ row }) => (
          <OrderPlatformBadge
            platform={row.original.platform}
            isSandbox={row.original.isSandbox}
          />
        ),
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
      {
        id: "actions",
        header: "",
        enableSorting: false,
        size: 50,
        cell: ({ row }) => (
          <OrderRowActions
            order={row.original}
            onEdit={loadAndEditOrder}
            onDelete={setOrderPendingDeletion}
          />
        ),
      },
    ],
    [loadAndEditOrder],
  );

  const openExport = (rows: OrderListItem[]) => {
    setExportRows(rows);
    setExportOpen(true);
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
          <Button onClick={openCreate}>
            <Plus size={15} /> New order
          </Button>
        </PermissionGuard>
      </div>

      {/* Summary cards */}
      {summary && summary.byStatus.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {summary.byStatus.slice(0, 4).map((s) => (
            <StatCard
              key={s.status}
              label={ORDER_STATUS_META[s.status].label}
              value={s.count}
              active={status === s.status}
              onClick={() => setStatus(status === s.status ? "" : s.status)}
            />
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
        onExport={openExport}
        onDeleteSelected={(rows) => setBulkDeleteTargets(rows)}
        emptyMessage="No orders yet."
        defaultPageSize={20}
        maxBodyHeight="60vh"
        toolbar={
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-[340px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
              />
              <Input
                className="pl-8 text-[13px]"
                placeholder="Search by order #, customer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={status || "__all__"}
              onValueChange={(v) =>
                setStatus(v === "__all__" ? "" : (v as OrderStatus))
              }
            >
              <SelectTrigger className="w-[160px] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All statuses</SelectItem>
                {ORDER_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_META[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {/* Load more for infinite scroll */}
      {hasNextPage && (
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && (
              <Loader2 size={13} className="animate-spin" />
            )}
            Load more
          </Button>
        </div>
      )}

      {selectedId && (
        <OrderDetailSheet
          orderId={selectedId}
          onClose={() => setSelectedId("")}
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
            const editedId = editing.id;
            updateOrder.mutate(
              { id: editedId, payload: values },
              {
                onSuccess: () => {
                  setFormOpen(false);
                  setSelectedId(editedId);
                },
              },
            );
          } else {
            createOrder.mutate(values, { onSuccess: () => setFormOpen(false) });
          }
        }}
      />

      <ConfirmDialog
        open={!!orderPendingDeletion}
        onClose={() => setOrderPendingDeletion(null)}
        onConfirm={() => {
          if (!orderPendingDeletion) return;
          deleteOrder.mutate(orderPendingDeletion.id, {
            onSuccess: () => setOrderPendingDeletion(null),
          });
        }}
        title={`Delete order #${orderPendingDeletion?.orderNumber ?? ""}?`}
        description="This permanently removes the order. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteOrder.isPending}
      />

      <ConfirmDialog
        open={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={() => {
          bulkDeleteTargets.forEach((o) => deleteOrder.mutate(o.id));
          setBulkDeleteTargets([]);
        }}
        title={`Delete ${bulkDeleteTargets.length} order${bulkDeleteTargets.length === 1 ? "" : "s"}?`}
        description="The selected orders will be permanently removed. This action cannot be undone."
        confirmLabel="Delete orders"
        loading={deleteOrder.isPending}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirm={(name) => downloadOrdersCsv(exportRows, name)}
        defaultName={`orders_export_${new Date().toISOString().split("T")[0]}`}
        count={exportRows.length}
        title="Export orders"
      />
    </div>
  );
}
