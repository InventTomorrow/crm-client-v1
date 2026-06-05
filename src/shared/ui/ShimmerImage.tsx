"use client";

import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "./Motion";

type ShimmerImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string | undefined;
  alt: string;
  /** Extra classes for the wrapper (sizing/rounding usually live here). */
  wrapperClassName?: string;
  /** Classes applied to the wrapper only while loading — gives variable-height
   *  images (e.g. chat bubbles) a footprint so the shimmer is visible. */
  loadingClassName?: string;
};

/**
 * Drop-in <img> replacement that shows a shimmer skeleton while the remote image
 * loads and a muted placeholder if it fails. Use for any image fetched from a
 * server (products, attachments) — not for local object-URL previews.
 *
 * Uses a plain <img> (not next/image) on purpose: image URLs come from arbitrary
 * upload hosts (S3, blob storage) that aren't declared in next.config, matching
 * how the rest of the app renders remote images.
 */
export function ShimmerImage({
  src,
  alt,
  className,
  wrapperClassName,
  loadingClassName,
  ...imgProps
}: ShimmerImageProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(
    "loading",
  );

  return (
    <span
      className={cn(
        "relative block overflow-hidden",
        wrapperClassName,
        status !== "loaded" && loadingClassName,
      )}
    >
      {status === "loading" && (
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      )}

      {status === "error" ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[var(--surface-2)] text-[var(--ink-mute)]">
          <ImageOff className="h-5 w-5" />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...imgProps}
          src={src}
          alt={alt}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={cn(
            "transition-opacity duration-300",
            status === "loaded" ? "opacity-100" : "opacity-0",
            className,
          )}
        />
      )}
    </span>
  );
}
