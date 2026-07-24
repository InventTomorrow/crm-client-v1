"use client";

import { cn, getImageUrl } from "@/lib/utils";
import {
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/shared/hooks/useFileUpload";
import {
  CircleAlertIcon,
  CloudUploadIcon,
  FileIcon,
  InfoIcon,
  Loader2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./Alert";
import { Button } from "./Button";

export interface FileUploadProps {
  /** Controlled — the currently uploaded file's URL, like ImageUploader. */
  value?: string | null;
  onChange?: (url: string | null) => void;
  /** Called with the picked File — should resolve to the final public URL (e.g. S3). */
  onUpload?: (file: File) => Promise<string>;
  /** Pass mutation.isPending from the parent to drive the uploading indicator. */
  isUploading?: boolean;
  /** Live upload percentage (0-100), if the parent's onUpload reports progress. Shown over the preview while uploading. */
  progress?: number | null;
  /** Which step of the upload is in flight — e.g. from usePresignedUpload's `phase`.
   * Drives the label shown over the preview ("Preparing upload…" vs "Uploading 42%"). */
  uploadPhase?: "idle" | "requesting-url" | "uploading";
  maxSize?: number;
  accept?: string;
  /** Tailwind aspect-ratio class for the drop zone, e.g. "aspect-square", "aspect-21/9". Ignored when `compact` is set. */
  aspectRatio?: string;
  /** Renders a dense rectangular bar (fixed height, icon + one-line text) instead of the full square drop zone — for tight form layouts. */
  compact?: boolean;
  /** Tailwind height class used when `compact` is set, e.g. "h-[120px]". Lets callers reuse the same component at different sizes. */
  compactHeight?: string;
  /** Icon-only square thumbnail (no title/description/hint text, small always-visible remove button) — for per-row images like variant swatches. Implies `compact`; pair with a small `compactHeight` (and a same-size wrapper) for a true thumbnail. */
  thumbnail?: boolean;
  title?: string;
  description?: string;
  hint?: string;
  /** Tips are hidden by default behind an info icon on the drop zone instead of always shown below it. */
  tipsCollapsible?: boolean;
  tipsTitle?: string;
  tips?: string[];
  className?: string;
  disabled?: boolean;
}

function toInitialPreview(
  value: string | null | undefined,
  accept: string,
): FileWithPreview | null {
  if (!value) return null;
  const metadata: FileMetadata = {
    id: "current",
    name: value.split("/").pop() ?? "file",
    size: 0,
    type: accept.startsWith("image/") ? "image/*" : "application/octet-stream",
    url: value,
  };
  return {
    id: metadata.id,
    file: metadata,
    preview: getImageUrl(value) ?? value,
  };
}

export function FileUpload({
  value,
  onChange,
  onUpload,
  isUploading: isUploadingProp,
  progress,
  uploadPhase = "idle",
  maxSize = 5 * 1024 * 1024,
  accept = "image/*",
  aspectRatio = "aspect-square",
  compact = false,
  compactHeight = "h-[120px]",
  thumbnail = false,
  title = "Upload a file",
  description = "Drag and drop here, or click to browse",
  hint,
  tipsCollapsible = false,
  tipsTitle,
  tips,
  className,
  disabled = false,
}: FileUploadProps) {
  const [preview, setPreview] = useState<FileWithPreview | null>(() =>
    toInitialPreview(value, accept),
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(false);
  const hasTips = !!tips && tips.length > 0;
  const tipsVisible = hasTips && (!tipsCollapsible || showTips);
  const isCompact = compact || thumbnail;
  const sizeClassName = isCompact ? compactHeight : aspectRatio;

  // Keep in sync when the parent resets/changes `value` externally (e.g. switching records in edit mode).
  useEffect(() => {
    setPreview(toInitialPreview(value, accept));
  }, [value, accept]);

  const uploading = isUploadingProp ?? isUploading;

  const [
    { isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize,
    accept,
    multiple: false,
    onFilesChange: (files) => {
      if (files.length === 0) return;
      const picked = files[0];
      if (!picked) return;
      setPreview(picked);
      setUploadError(null);

      const file = picked.file;
      if (!(file instanceof File)) return;

      if (onUpload) {
        setIsUploading(true);
        onUpload(file)
          .then((url) => onChange?.(url))
          .catch(() => setUploadError("Upload failed. Please try again."))
          .finally(() => setIsUploading(false));
      } else {
        onChange?.(picked.preview ?? null);
      }
    },
  });

  const removeFile = () => {
    if (disabled) return;
    setPreview(null);
    setUploadError(null);
    onChange?.(null);
  };

  const currentFile = preview?.file;
  const isImage = !!currentFile && currentFile.type.startsWith("image/");
  const fileName = currentFile?.name ?? null;

  return (
    <div className={cn("w-full space-y-3", className)}>
      <div
        className={cn(
          "group border-border rounded-xl relative overflow-hidden border transition-all duration-200",
          disabled && "pointer-events-none opacity-50",
          isDragging
            ? "border-primary bg-primary/5 border-dashed"
            : preview
              ? "border-border bg-background hover:border-primary/50"
              : "border-muted-foreground/25 bg-muted/30 hover:border-primary hover:bg-primary/5 border-dashed",
        )}
        onDragEnter={disabled ? undefined : handleDragEnter}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDragOver={disabled ? undefined : handleDragOver}
        onDrop={disabled ? undefined : handleDrop}
      >
        <input {...getInputProps()} className="sr-only" disabled={disabled} />

        {preview ? (
          <div className={cn("relative w-full", sizeClassName)}>
            {isImage && preview.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              // Plain <img>, not next/image: these URLs come from arbitrary
              // upload hosts (S3, blob storage) not declared in next.config —
              // same reasoning as ShimmerImage.
              <img
                src={preview.preview}
                alt={fileName ?? "Uploaded file"}
                className={cn(
                  "absolute inset-0 h-full w-full",
                  isCompact ? "object-contain" : "object-cover",
                )}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted">
                <FileIcon className="text-muted-foreground size-8" />
                <span className="text-muted-foreground max-w-full truncate px-2 text-xs">
                  {fileName}
                </span>
              </div>
            )}

            {thumbnail ? (
              <>
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="absolute inset-0 cursor-pointer bg-black/0 transition-colors hover:bg-black/30"
                  title="Change image"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  title="Remove image"
                  className="bg-background/90 text-muted-foreground hover:text-destructive absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full border shadow-sm"
                >
                  <XIcon className="size-2.5" />
                </button>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={openFileDialog}
                      size="sm"
                      variant="outline"
                    >
                      <UploadIcon /> Change
                    </Button>
                    <Button type="button" onClick={removeFile} size="sm">
                      <XIcon /> Remove
                    </Button>
                  </div>
                </div>
              </>
            )}

            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
                <Loader2Icon
                  className={cn("animate-spin text-white", thumbnail ? "size-4" : "size-8")}
                />
                {!thumbnail && (
                  <span className="text-sm font-medium text-white">
                    {uploadPhase === "uploading" && typeof progress === "number"
                      ? `Uploading ${progress}%`
                      : "Preparing upload…"}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : thumbnail ? (
          <div
            className={cn("flex w-full cursor-pointer items-center justify-center", compactHeight)}
            onClick={openFileDialog}
          >
            <CloudUploadIcon className="text-primary size-4" />
          </div>
        ) : compact ? (
          <div
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 px-4",
              compactHeight,
            )}
            onClick={openFileDialog}
          >
            <div className="bg-primary/10 shrink-0 rounded-full p-2">
              <CloudUploadIcon className="text-primary size-4" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-[12.5px] font-medium">
                {description}
              </p>
              {hint && (
                <p className="text-muted-foreground truncate text-[11px]">
                  {hint}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center",
              aspectRatio,
            )}
            onClick={openFileDialog}
          >
            <div className="bg-primary/10 rounded-full p-4">
              <CloudUploadIcon className="text-primary size-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
              {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
            </div>
            <Button type="button" variant="outline" size="sm">
              <UploadIcon /> Browse Files
            </Button>
          </div>
        )}

        {hasTips && tipsCollapsible && (
          <button
            type="button"
            title={showTips ? "Hide tips" : "Show tips"}
            onClick={(e) => {
              e.stopPropagation();
              setShowTips((v) => !v);
            }}
            className="bg-background/80 text-muted-foreground hover:text-foreground absolute top-2 right-2 flex size-6 items-center justify-center rounded-full border"
          >
            <InfoIcon className="size-3.5" />
          </button>
        )}
      </div>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Upload failed</AlertTitle>
          <AlertDescription>
            <p>{uploadError}</p>
          </AlertDescription>
        </Alert>
      )}

      {tipsVisible && (
        <div className="bg-muted/50 rounded-lg p-4">
          {tipsTitle && (
            <h4 className="mb-2 text-sm font-medium">{tipsTitle}</h4>
          )}
          <ul className="text-muted-foreground space-y-1 text-xs">
            {tips.map((tip, index) => (
              <li key={index}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
