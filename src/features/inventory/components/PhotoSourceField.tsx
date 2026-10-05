"use client";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { Link2, Upload } from "lucide-react";
import { useState, type ReactNode } from "react";
import { ImageLinkField } from "./ImageLinkField";

type PhotoSource = "upload" | "link";

const SOURCE_ITEM_CLASS =
  "gap-1 data-[state=on]:border-[var(--accent)] data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-[var(--accent)]";

/**
 * One photo, two ways in: upload a file or add a link — only one is open at a time.
 * Adding a link switches back to the uploader, which then shows the linked photo.
 */
export function PhotoSourceField({
  label,
  children,
  onLinkSubmit,
  disabled,
  className,
}: Readonly<{
  label?: string;
  /** The upload field, shown while "Upload" is active. */
  children: ReactNode;
  onLinkSubmit: (url: string) => void;
  /** Also pass while an upload is in flight — switching away would unmount the uploader mid-upload. */
  disabled?: boolean;
  className?: string;
}>) {
  const [source, setSource] = useState<PhotoSource>("upload");

  const submitLink = (url: string) => {
    onLinkSubmit(url);
    setSource("upload");
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        {label && (
          <span className="text-[12px] font-medium text-[var(--ink-soft)]">
            {label}
          </span>
        )}
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={source}
          onValueChange={(value) => {
            // Radix sends "" when the active item is clicked again — one source always stays active.
            if (value) setSource(value as PhotoSource);
          }}
          disabled={disabled}
          aria-label="Photo source"
          className="ml-auto"
        >
          <ToggleGroupItem value="upload" className={SOURCE_ITEM_CLASS}>
            <Upload /> Upload
          </ToggleGroupItem>
          <ToggleGroupItem value="link" className={SOURCE_ITEM_CLASS}>
            <Link2 /> Add link
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {source === "upload" ? (
        children
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-[var(--ink-mute)]/35 bg-[var(--surface-2)]/40 p-3">
          <ImageLinkField
            onSubmit={submitLink}
            onCancel={() => setSource("upload")}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}
