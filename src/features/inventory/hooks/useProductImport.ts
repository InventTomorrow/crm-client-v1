"use client";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { BulkItem } from "../types";
import {
  parseProductsCsv,
  parseProductsJson,
} from "../utils/importProductsCsv";
import { useBulkAddProducts } from "./useProducts";

export type ImportFormat = "csv" | "json";

/** Where the import page is: picking a file, reading it, or checking the rows. */
export type ImportPhase = "choose" | "importing" | "review";

/**
 * Parsing a small file finishes in a blink, which reads as "nothing happened".
 * The progress runs for this long regardless, so the seller sees the work.
 */
export const MIN_IMPORT_MS = 2000;

/** The beat on 100% before the rows replace the progress bar. */
const HANDOFF_MS = 900;

export function useProductImport() {
  const router = useRouter();
  const bulkAddProducts = useBulkAddProducts();

  const [phase, setPhase] = useState<ImportPhase>("choose");
  const [progress, setProgress] = useState(0);
  const [items, setItems] = useState<BulkItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const formatRef = useRef<ImportFormat>("csv");

  const runImport = useCallback(async (file: File, format: ImportFormat) => {
    setPhase("importing");
    setProgress(0);
    setFileName(file.name);

    const startedAt = Date.now();
    const ticker = setInterval(() => {
      // Eases towards 95% over the minimum run, then waits for the parse.
      const elapsed = (Date.now() - startedAt) / MIN_IMPORT_MS;
      setProgress(Math.min(95, Math.round(elapsed * 95)));
    }, 60);

    try {
      const [parsed] = await Promise.all([
        parseFile(file, format),
        new Promise((resolve) => setTimeout(resolve, MIN_IMPORT_MS)),
      ]);
      clearInterval(ticker);

      if (parsed.length === 0) {
        toast.error("No products found in that file");
        setPhase("choose");
        return;
      }

      setProgress(100);
      setTimeout(() => {
        setItems(parsed);
        setSelectedIndex(0);
        setPhase("review");
      }, HANDOFF_MS);
    } catch (error) {
      clearInterval(ticker);
      setPhase("choose");
      toast.error(
        error instanceof Error ? error.message : "Could not read that file",
      );
    }
  }, []);

  const updateItem = useCallback((index: number, item: BulkItem) => {
    setItems((prev) =>
      prev.map((existing, i) => (i === index ? item : existing)),
    );
  }, []);

  const removeItem = useCallback(
    (index: number) => {
      // Selection follows the gap: the row that slid into this slot, or the one
      // before it when the list ends here.
      const remaining = items.length - 1;
      setItems((prev) => prev.filter((_, i) => i !== index));
      setSelectedIndex(remaining === 0 ? null : Math.min(index, remaining - 1));
    },
    [items.length],
  );

  /** Back to an empty picker — used by "Import another file" and after a discard. */
  const reset = useCallback(() => {
    setItems([]);
    setSelectedIndex(null);
    setFileName("");
    setProgress(0);
    setPhase("choose");
  }, []);

  const saveAll = useCallback(() => {
    bulkAddProducts.mutate(items.map(toCreatePayload), {
      onSuccess: () => router.push("/inventory"),
    });
  }, [bulkAddProducts, items, router]);

  return {
    phase,
    progress,
    items,
    fileName,
    selectedIndex,
    setSelectedIndex,
    formatRef,
    runImport,
    updateItem,
    removeItem,
    reset,
    saveAll,
    isSaving: bulkAddProducts.isPending,
  };
}

/** Reads the picked file and turns it into review rows. */
function parseFile(file: File, format: ImportFormat): Promise<BulkItem[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        resolve(
          format === "json" ? parseProductsJson(text) : parseProductsCsv(text),
        );
      } catch {
        reject(
          new Error(
            `That does not look like a valid ${format.toUpperCase()} file`,
          ),
        );
      }
    };
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.readAsText(file);
  });
}

function toCreatePayload(item: BulkItem) {
  return {
    name: item.name,
    sku: item.sku || undefined,
    price: item.price,
    discountPercentage: item.discountPercentage,
    stock: item.stock,
    description: item.desc || undefined,
    category: item.cat || undefined,
    gender: item.gender || undefined,
    color: item.color || undefined,
    sizes: item.sizes ?? [],
    imageUrls: item.imageUrls ?? (item.imageUrl ? [item.imageUrl] : []),
  };
}
