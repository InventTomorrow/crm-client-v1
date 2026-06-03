"use client";
import { cn, getImageUrl } from "@/lib/utils";
import { Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** If provided, called with the File — should return the final public URL (e.g. from S3). */
  onUpload?: (file: File) => Promise<string>;
  /** Pass mutation.isPending from the parent — drives the uploading indicator. */
  isUploading?: boolean;
  className?: string;
  compact?: boolean;
}

export function ImageUploader({
  value,
  onChange,
  onUpload,
  isUploading = false,
  className,
  compact,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (onUpload) {
        try {
          const url = await onUpload(file);
          if (url) onChange(url);
        } catch (e) {
          console.error("Upload failed", e);
        }
      } else {
        // Fallback: local base64 preview (no server)
        const reader = new FileReader();
        reader.onload = (e) => onChange(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    },
    [onUpload, onChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const h = compact ? "h-[80px]" : "h-[120px]";

  if (isUploading) {
    return (
      <div
        className={cn(
          `flex ${h} items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--accent)] bg-[var(--accent-soft)]`,
          className,
        )}
      >
        <Loader2 size={18} className="animate-spin text-[var(--accent)]" />
        <span className="text-[12.5px] text-[var(--accent)] font-medium">
          Uploading…
        </span>
      </div>
    );
  }

  if (value) {
    return (
      <div
        className={cn(`relative ${h} overflow-hidden rounded-lg`, className)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(value)}
          alt="Product"
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
        >
          <X size={13} />
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={cn(
        `flex ${h} cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed transition-colors`,
        isDragging
          ? "border-[var(--accent)] bg-[var(--accent-soft)]"
          : "border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
        <Upload size={15} />
      </span>
      {!compact && (
        <div className="text-center">
          <p className="text-[12.5px] font-medium text-[var(--ink-soft)]">
            Drop image or{" "}
            <span className="text-[var(--accent)]">click to upload</span>
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">
            PNG, JPG, WEBP — up to 5 MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}
