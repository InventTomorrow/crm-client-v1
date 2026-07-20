"use client";
import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Button } from "./Button";
import { Input } from "./Input";

/**
 * Reusable CSV export dialog: asks for a file name (pre-filled with a sensible
 * default) and shows a spinner while the export runs. The caller does the
 * actual CSV build/download in `onConfirm` and appends `.csv` itself.
 */
export function ExportDialog({
  open,
  onClose,
  onConfirm,
  defaultName,
  count,
  title = "Export CSV",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void | Promise<void>;
  defaultName: string;
  count?: number;
  title?: string;
}) {
  const [name, setName] = useState(defaultName);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setLoading(false);
    }
  }, [open, defaultName]);

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm(name.trim() || defaultName);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !loading) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[16px] font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] text-[var(--ink-mute)]">
            {typeof count === "number"
              ? `${count} row${count === 1 ? "" : "s"} · `
              : ""}
            Choose a file name for your export.
          </DialogDescription>
        </DialogHeader>

        <div className="py-1">
          <label className="text-[12px] font-medium text-[var(--ink-soft)]">
            File name
          </label>
          <div className="mt-1 flex items-center gap-2">
            <Input
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              disabled={loading}
            />
            <span className="text-[12.5px] text-[var(--ink-mute)]">.csv</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={loading || !name.trim()}>
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            Export
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
