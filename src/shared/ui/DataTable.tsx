"use client";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Download,
} from "lucide-react";
import { useState } from "react";

export type { ColumnDef };

const PAGE_SIZES = [10, 20, 50, 100] as const;

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  /** Show checkboxes for row selection */
  selectable?: boolean;
  /** Called with selected rows when user clicks delete */
  onDeleteSelected?: (rows: TData[]) => void;
  /** Called with all rows for export */
  onExport?: (rows: TData[]) => void;
  /** Extra toolbar content (filters, buttons) */
  toolbar?: React.ReactNode;
  /** Empty state */
  emptyMessage?: string;
  /** Whether data is loading */
  isLoading?: boolean;
  /** Default page size */
  defaultPageSize?: number;
  className?: string;
}

export function DataTable<TData>({
  data,
  columns,
  selectable = false,
  onDeleteSelected,
  onExport,
  toolbar,
  emptyMessage = "No data found.",
  isLoading = false,
  defaultPageSize = 20,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Prepend selection column if needed
  const allColumns: ColumnDef<TData, unknown>[] = selectable
    ? [
        {
          id: "__select",
          size: 40,
          header: ({ table }) => (
            <input
              type="checkbox"
              className="rounded border-[var(--line)] accent-[var(--accent)] w-3.5 h-3.5 cursor-pointer"
              checked={table.getIsAllPageRowsSelected()}
              ref={(el) => {
                if (el) el.indeterminate = table.getIsSomePageRowsSelected();
              }}
              onChange={table.getToggleAllPageRowsSelectedHandler()}
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              className="rounded border-[var(--line)] accent-[var(--accent)] w-3.5 h-3.5 cursor-pointer"
              checked={row.getIsSelected()}
              onChange={row.getToggleSelectedHandler()}
              onClick={(e) => e.stopPropagation()}
            />
          ),
          enableSorting: false,
        },
        ...columns,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, columnFilters, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  // Sync pageSize into table when changed
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    table.setPageSize(size);
  };

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((r) => r.original);

  const { pageIndex } = table.getState().pagination;
  const totalPages = table.getPageCount();

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Toolbar */}
      {(toolbar || selectable) && (
        <div className="flex items-center gap-2 flex-wrap">
          {toolbar}
          <div className="flex-1" />
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-1.5 text-[12.5px] text-[var(--ink-soft)]">
              <span className="font-medium text-[var(--ink)]">{selectedRows.length}</span> selected
              {onDeleteSelected && (
                <button
                  className="btn btn-ghost text-[#DC2626] p-1.5 ml-1"
                  onClick={() => {
                    onDeleteSelected(selectedRows);
                    setRowSelection({});
                  }}
                  title="Delete selected"
                >
                  <Trash2 size={14} />
                </button>
              )}
              {onExport && (
                <button
                  className="btn btn-ghost p-1.5"
                  onClick={() => onExport(selectedRows)}
                  title="Export selected"
                >
                  <Download size={14} />
                </button>
              )}
            </div>
          )}
          {onExport && selectedRows.length === 0 && (
            <button
              className="btn btn-outline text-[12.5px] py-1.5 px-3"
              onClick={() => onExport(data)}
              title="Export all"
            >
              <Download size={13} /> Export
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-[var(--line)] bg-[var(--surface-2)]">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase tracking-wide text-[var(--ink-mute)] whitespace-nowrap select-none",
                        header.column.getCanSort() && "cursor-pointer hover:text-[var(--ink)]",
                      )}
                      style={{ width: header.column.getSize() !== 150 ? header.column.getSize() : undefined }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-[var(--ink-mute)] opacity-60">
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp size={11} />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown size={11} />
                            ) : (
                              <ArrowUpDown size={11} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--line-soft)]">
                    {allColumns.map((_, ci) => (
                      <td key={ci} className="px-3 py-3">
                        <div className="h-4 rounded bg-[var(--surface-2)] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={allColumns.length}
                    className="px-3 py-10 text-center text-[var(--ink-mute)] text-[12.5px]"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      "border-b border-[var(--line-soft)] transition-colors hover:bg-[var(--surface-2)]",
                      row.getIsSelected() && "bg-[var(--accent-soft)]",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 flex-wrap text-[12.5px] text-[var(--ink-soft)]">
        {/* Items per page */}
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="input py-1 px-2 h-auto text-[12.5px] w-auto"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Page info */}
        <span className="text-[var(--ink-mute)]">
          {table.getFilteredRowModel().rows.length > 0
            ? `${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length}`
            : "0 results"}
        </span>

        {/* Nav buttons */}
        <div className="flex items-center gap-1">
          <button
            className="btn btn-ghost p-1.5 disabled:opacity-30"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            title="First page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            className="btn btn-ghost p-1.5 disabled:opacity-30"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            title="Previous page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Page number pills */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const startPage = Math.max(0, Math.min(pageIndex - 2, totalPages - 5));
            const page = startPage + i;
            return (
              <button
                key={page}
                onClick={() => table.setPageIndex(page)}
                className={cn(
                  "w-7 h-7 rounded-md text-[12px] font-medium transition-colors",
                  page === pageIndex
                    ? "bg-[var(--accent)] text-white"
                    : "btn btn-ghost",
                )}
              >
                {page + 1}
              </button>
            );
          })}

          <button
            className="btn btn-ghost p-1.5 disabled:opacity-30"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            title="Next page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            className="btn btn-ghost p-1.5 disabled:opacity-30"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            title="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
