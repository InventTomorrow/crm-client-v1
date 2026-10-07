"use client";
import { useAppStore } from "@/lib/appStore";
import { useCallback, useMemo } from "react";
import { useSavedSizesStore } from "../stores/savedSizesStore";
import {
  getCustomSizesInCategory,
  mergeSizeLists,
  toCategoryKey,
} from "../utils/customSizes";
import { useProducts } from "./useProducts";

const NO_SAVED_SIZES: readonly string[] = [];

/** The seller's own sizes for a category: ones products already use, then ones saved in this browser. */
export function useCustomSizeOptions(category?: string) {
  const { data: products = [] } = useProducts();
  const workspaceId = useAppStore((state) => state.currentWorkspaceId);
  const scopeKey = `${workspaceId}:${toCategoryKey(category)}`;
  const savedSizes =
    useSavedSizesStore((state) => state.sizesByScope[scopeKey]) ??
    NO_SAVED_SIZES;
  const saveSize = useSavedSizesStore((state) => state.saveSize);

  const customSizeOptions = useMemo(
    () =>
      mergeSizeLists(getCustomSizesInCategory(products, category), savedSizes),
    [products, category, savedSizes],
  );

  const saveCustomSize = useCallback(
    (size: string) => saveSize(scopeKey, size),
    [saveSize, scopeKey],
  );

  return { customSizeOptions, saveCustomSize };
}
