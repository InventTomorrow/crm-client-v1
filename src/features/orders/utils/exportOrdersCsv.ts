import type { OrderListItem } from "../types";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** Builds a CSV from the given orders and triggers a browser download. */
export function downloadOrdersCsv(rows: OrderListItem[], filename?: string) {
  const csv = [
    ["Order", "Customer", "Items", "Total", "Status", "Date"].join(","),
    ...rows.map((o) =>
      [
        `#${o.orderNumber}`,
        o.customerName || o.lead?.name || "Unknown",
        o.items.length,
        o.total,
        o.status,
        new Date(o.createdAt).toLocaleDateString(),
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename?.trim() || `orders_export_${new Date().toISOString().split("T")[0]}`}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
