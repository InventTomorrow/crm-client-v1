"use client";
import type { RowSelectionState } from "@tanstack/react-table";
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface TableSelection<TData> {
  rowSelection: RowSelectionState;
  setRowSelection: Dispatch<SetStateAction<RowSelectionState>>;
  selectedRows: TData[];
  setSelectedRows: (rows: TData[]) => void;
  clearSelection: () => void;
}

const haveSameRows = <TData>(first: TData[], second: TData[]) =>
  first.length === second.length &&
  first.every((row, index) => row === second[index]);

/** Lifts a DataTable's selection so the page can swap its search field for bulk actions. */
export function useTableSelection<TData>(): TableSelection<TData> {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedRows, setSelectedRowsState] = useState<TData[]>([]);

  // Bails out on identical rows so DataTable's sync effect can't loop.
  const setSelectedRows = useCallback((rows: TData[]) => {
    setSelectedRowsState((current) =>
      haveSameRows(current, rows) ? current : rows,
    );
  }, []);

  const clearSelection = useCallback(() => {
    setRowSelection({});
    setSelectedRowsState([]);
  }, []);

  return useMemo(
    () => ({
      rowSelection,
      setRowSelection,
      selectedRows,
      setSelectedRows,
      clearSelection,
    }),
    [rowSelection, selectedRows, setSelectedRows, clearSelection],
  );
}
