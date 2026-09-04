"use client";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

type ExportFormat = "jpeg" | "png";

/** Fetches the image, re-encodes it on a canvas, and triggers a browser download. */
async function downloadAs(
  sourceUrl: string,
  format: ExportFormat,
  filenameBase: string,
): Promise<void> {
  const response = await fetch(sourceUrl, { credentials: "include" });
  if (!response.ok) throw new Error("Could not fetch the image");
  const sourceBlob = await response.blob();
  const objectUrl = URL.createObjectURL(sourceBlob);

  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load the image"));
      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser");

    // JPEG has no alpha channel — flatten onto white first, or transparent
    // areas render black.
    if (format === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    const outputBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, `image/${format}`, 0.95),
    );
    if (!outputBlob) throw new Error("Could not export the image");

    const downloadUrl = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${filenameBase}.${format === "jpeg" ? "jpg" : "png"}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function ImagePreviewDialog({
  open,
  onClose,
  imageUrl,
  caption,
  filenameBase,
}: {
  open: boolean;
  onClose: () => void;
  /** Raw stored URL (not yet passed through getImageUrl) — null closes cleanly mid-transition. */
  imageUrl: string | null;
  caption: string;
  filenameBase: string;
}) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedUrl = getImageUrl(imageUrl ?? undefined);

  const handleExport = async (format: ExportFormat) => {
    if (!resolvedUrl) return;
    setExporting(format);
    setError(null);
    try {
      await downloadAs(resolvedUrl, format, filenameBase);
    } catch {
      setError("Could not export this image. Try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold pr-6 truncate">
            {caption}
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-2">
          {resolvedUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- full-size preview of a user-uploaded photo, not a page asset
            <img
              src={resolvedUrl}
              alt={caption}
              className="max-h-[65vh] w-auto max-w-full rounded-md object-contain"
            />
          )}
        </div>

        {error && <p className="text-[12px] text-destructive">{error}</p>}

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-[11.5px] text-[var(--ink-mute)]">
            Export as
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => handleExport("jpeg")}
            >
              {exporting === "jpeg" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              JPG
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting !== null}
              onClick={() => handleExport("png")}
            >
              {exporting === "png" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Download size={13} />
              )}
              PNG
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
