'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { MAX_ORDER_IMPORT_FILE_BYTES } from '../types';
import { useCommitOrdersImport, usePreviewOrdersImport } from './useOrders';

/** Drives the import dialog: pick a CSV → dry-run preview → commit the ready orders. */
export function useOrdersImport() {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string | null>(null);
  const preview = usePreviewOrdersImport();
  const commit = useCommitOrdersImport();
  const { reset: resetPreview } = preview;
  const { reset: resetCommit } = commit;

  const importResult = commit.data ?? preview.data ?? null;

  const selectFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Choose a .csv file');
      return;
    }
    if (file.size > MAX_ORDER_IMPORT_FILE_BYTES) {
      toast.error('This file is too large — split it into files under 750 KB');
      return;
    }
    const text = await file.text();
    resetCommit();
    setSelectedFileName(file.name);
    setCsvText(text);
    preview.mutate(text);
  };

  const confirmImport = () => {
    if (csvText) commit.mutate(csvText);
  };

  const reset = useCallback(() => {
    setSelectedFileName(null);
    setCsvText(null);
    resetPreview();
    resetCommit();
  }, [resetPreview, resetCommit]);

  return {
    selectedFileName,
    importResult,
    isCommitted: Boolean(commit.data),
    isPreviewing: preview.isPending,
    isImporting: commit.isPending,
    readyOrderCount: preview.data?.counts.ready ?? 0,
    selectFile,
    confirmImport,
    reset,
  };
}
