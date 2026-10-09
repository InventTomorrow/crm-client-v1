"use client";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useOpenLeadChat } from "@/features/leads/hooks/useOpenLeadChat";
import { useDebouncedUrlSearch } from "@/shared/hooks/useDebouncedUrlSearch";
import { useUrlState } from "@/shared/hooks/useUrlState";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import { ExportDialog } from "@/shared/ui/ExportDialog";
import { Input } from "@/shared/ui/Input";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { StatCard } from "@/shared/ui/StatCard";
import {
  Download,
  Image as ImageIcon,
  Loader2,
  Plus,
  Search,
  StickyNote,
  Upload,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useDeleteOrder,
  useExportOrders,
  useOrders,
  useOrdersSummary,
  useRefreshOrders,
} from "../hooks/useOrders";
import { ORDER_STATUS_META, formatMoney } from "../lib/format";
import {
  MAX_EXPORT_SELECTED_ORDERS,
  ORDER_STATUS_OPTIONS,
  type OrderFilters,
  type OrderListItem,
  type OrderStatus,
} from "../types";
import { OrderDetailSheet } from "./OrderDetailSheet";
import { OrderPlatformBadge } from "./OrderPlatformBadge";
import { OrderRowActions } from "./OrderRowActions";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrdersImportDialog } from "./OrdersImportDialog";

/** Selected rows export by id; null ids exports every order matching the current filters. */
interface OrdersExportScope {
  selectedOrderIds: string[] | null;
}

export function OrdersView() {
  const { search, searchInput, setSearchInput } = useDebouncedUrlSearch("q");
  const [statusParam, setStatus] = useUrlState("status");
  const status = statusParam as OrderStatus | "";
  const [customizationParam, setCustomizationParam] =
    useUrlState("customization");
  const [selectedId, setSelectedId] = useUrlState("order");
  const router = useRouter();

  const filters: OrderFilters = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(customizationParam
        ? { hasCustomization: customizationParam === "yes" }
        : {}),
    }),
    [search, status, customizationParam],
  );

  const [orderPendingDeletion, setOrderPendingDeletion] =
    useState<OrderListItem | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<OrderListItem[]>(
    [],
  );
  const [ordersExportScope, setOrdersExportScope] =
    useState<OrdersExportScope | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { can } = usePermissions();
  const {
    openLeadChat,
    verifyingLeadId,
    unreachableMessage,
    dismissUnreachableMessage,
  } = useOpenLeadChat();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useOrders(filters);
  const { data: summary } = useOrdersSummary();
  const { refreshOrders, isRefreshing } = useRefreshOrders();
  const deleteOrder = useDeleteOrder();
  const exportOrders = useExportOrders();

  const orders = useMemo(() => data?.pages.flat() ?? [], [data]);

  const openCreate = () => router.push("/orders/new");
  const openEdit = useCallback(
    (order: { id: string }) =>
      router.push(`/orders/${encodeURIComponent(order.id)}/edit`),
    [router],
  );

  // Tracked per order: many orders share one lead, so the lead id alone would spin every row.
  const [openingChatOrderId, setOpeningChatOrderId] = useState<string | null>(
    null,
  );

  // The inbox is keyed by lead, so an order without one has nothing to open.
  const openCustomerChat = useCallback(
    (order: OrderListItem) => {
      if (!order.lead) return;
      setOpeningChatOrderId(order.id);
      openLeadChat(order.lead);
    },
    [openLeadChat],
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
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
            #{row.original.orderNumber}
            {row.original.hasCustomization && (
              <ImageIcon
                size={12}
                className="text-[var(--ink-mute)]"
                aria-label="Has customization"
              />
            )}
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
        id: "notes",
        accessorFn: (o) => o.notes ?? "",
        header: "Notes",
        enableSorting: false,
        size: 220,
        cell: ({ row }) =>
          row.original.notes ? (
            <p
              title={row.original.notes}
              className="line-clamp-2 max-w-[260px] whitespace-normal text-[12px] leading-snug text-[var(--ink-soft)]"
            >
              <StickyNote
                size={11}
                className="mr-1 inline -translate-y-px text-[var(--ink-mute)]"
              />
              {row.original.notes}
            </p>
          ) : (
            <span className="text-[12px] text-[var(--ink-mute)]">—</span>
          ),
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
        size: 90,
        cell: ({ row }) => (
          <OrderRowActions
            order={row.original}
            onEdit={openEdit}
            onDelete={setOrderPendingDeletion}
            onOpenCustomerChat={openCustomerChat}
            isOpeningChat={
              verifyingLeadId !== null && openingChatOrderId === row.original.id
            }
            isAnyChatOpening={verifyingLeadId !== null}
          />
        ),
      },
    ],
    [openEdit, openCustomerChat, verifyingLeadId, openingChatOrderId],
  );

  const canExportOrders = can("orders:export");

  const openSelectedExport = (selectedOrders: OrderListItem[]) => {
    if (selectedOrders.length > MAX_EXPORT_SELECTED_ORDERS) {
      toast.error(
        `Select up to ${MAX_EXPORT_SELECTED_ORDERS} orders, or clear the selection to export every matching order`,
      );
      return;
    }
    setOrdersExportScope({
      selectedOrderIds: selectedOrders.map((order) => order.id),
    });
  };

  const exportOrdersCsv = (filename: string) =>
    exportOrders
      .mutateAsync({
        ...filters,
        ...(ordersExportScope?.selectedOrderIds
          ? { ids: ordersExportScope.selectedOrderIds }
          : {}),
        filename,
      })
      // The hook already toasts the failure; swallow so the dialog can close.
      .catch(() => undefined);

  return (
    <div className="w-full p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
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
        <div data-tour="page-actions" className="flex items-center gap-2">
          <RefreshButton
            onRefresh={refreshOrders}
            isRefreshing={isRefreshing}
            label="Refresh orders"
          />
          <PermissionGuard permission="orders:create">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload size={15} /> Import
            </Button>
            <Button onClick={openCreate}>
              <Plus size={15} /> New order
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div
          data-tour="page-list"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5"
        >
          <StatCard
            label="Total revenue"
            value={formatMoney(summary.revenue ?? 0)}
            hint={`${summary.total} order${summary.total === 1 ? "" : "s"} · excludes cancelled`}
            Icon={Wallet}
            className="col-span-2 sm:col-span-1"
          />
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
        onExport={canExportOrders ? openSelectedExport : undefined}
        showExportAll={false}
        onDeleteSelected={(rows) => setBulkDeleteTargets(rows)}
        emptyMessage="No orders yet."
        defaultPageSize={20}
        maxVisibleRows={15}
        toolbar={
          <div className="card flex items-center gap-2 flex-1 flex-wrap p-2">
            <div className="relative w-full md:w-[320px]">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none z-10"
              />
              <Input
                className="pl-8 text-[13px]"
                placeholder="Search by order #, customer…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Select
              value={status || "__all__"}
              onValueChange={(v) =>
                setStatus(v === "__all__" ? "" : (v as OrderStatus))
              }
            >
              <SelectTrigger
                size="lg"
                className="min-w-0 flex-1 text-[13px] md:w-[170px] md:flex-none"
              >
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
            {/* <Select
              value={customizationParam || "__all__"}
              onValueChange={(v) =>
                setCustomizationParam(v === "__all__" ? "" : v)
              }
            >
              <SelectTrigger
                size="lg"
                className="w-full text-[13px] md:w-[190px]"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Any customization</SelectItem>
                <SelectItem value="yes">Has customization</SelectItem>
                <SelectItem value="no">No customization</SelectItem>
              </SelectContent>
            </Select> */}
            {canExportOrders && (
              <Button
                variant="outline"
                className="h-10 md:ml-auto"
                onClick={() =>
                  setOrdersExportScope({ selectedOrderIds: null })
                }
                disabled={orders.length === 0}
              >
                <Download size={13} /> Export
              </Button>
            )}
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
        open={!!ordersExportScope}
        onClose={() => setOrdersExportScope(null)}
        onConfirm={exportOrdersCsv}
        defaultName={`orders_export_${new Date().toISOString().split("T")[0]}`}
        count={ordersExportScope?.selectedOrderIds?.length}
        title={
          ordersExportScope?.selectedOrderIds
            ? "Export selected orders"
            : "Export all matching orders"
        }
      />

      <OrdersImportDialog
        open={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <ConfirmDialog
        open={!!unreachableMessage}
        onClose={dismissUnreachableMessage}
        onConfirm={dismissUnreachableMessage}
        title="Number Not Registered"
        description={unreachableMessage ?? undefined}
        confirmLabel="Got it"
        cancelLabel="Close"
        destructive
      />
    </div>
  );
}
