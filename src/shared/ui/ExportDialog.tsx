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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export type ExportFormat = "csv" | "json";

/**
 * Reusable export dialog: asks for a file name (pre-filled with a sensible
 * default) and shows a spinner while the export runs. The caller does the
 * actual file build/download in `onConfirm`, which receives the chosen
 * extension so it can branch on format. Pass `formats` with more than one
 * entry to show an extension picker instead of a fixed suffix.
 */
export function ExportDialog({
  open,
  onClose,
  onConfirm,
  defaultName,
  count,
  title = "Export CSV",
  formats = ["csv"],
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (filename: string, format: ExportFormat) => void | Promise<void>;
  defaultName: string;
  count?: number;
  title?: string;
  /** File formats the caller can produce. Defaults to CSV-only. */
  formats?: ExportFormat[];
}) {
  const [name, setName] = useState(defaultName);
  const [format, setFormat] = useState<ExportFormat>(formats[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      setFormat(formats[0]);
      setLoading(false);
    }
    // Formats is stable per caller — only re-seed when the dialog (re)opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultName]);

  const submit = async () => {
    setLoading(true);
    try {
      await onConfirm(name.trim() || defaultName, format);
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
            {formats.length > 1 ? (
              <Select
                value={format}
                onValueChange={(v) => setFormat(v as ExportFormat)}
              >
                <SelectTrigger className="w-[84px] text-[12.5px]" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map((f) => (
                    <SelectItem key={f} value={f}>
                      .{f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-[12.5px] text-[var(--ink-mute)]">
                .{format}
              </span>
            )}
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
