"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Check, Link2 } from "lucide-react";
import { useState } from "react";
import {
  isSupportedImageUrl,
  SUPPORTED_IMAGE_EXTENSIONS_LABEL,
} from "../utils/imageUrl";

/**
 * The alternative to uploading: paste a link to a photo already online.
 *
 * The link is only accepted once it looks like an image we can actually render,
 * because nothing downloads it here — it is stored as-is and shown to customers
 * later, so a page URL or a tracking link would surface as a broken photo.
 */
export function ImageLinkField({
  onSubmit,
  onCancel,
  disabled,
}: Readonly<{
  onSubmit: (url: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
}>) {
  const [link, setLink] = useState("");
  const [error, setError] = useState<string | null>(null);

  const applyLink = () => {
    const url = link.trim();
    if (!url) return;
    if (!isSupportedImageUrl(url)) {
      setError(
        `Paste a direct link to an image file — ${SUPPORTED_IMAGE_EXTENSIONS_LABEL}.`,
      );
      return;
    }
    onSubmit(url);
    setLink("");
    setError(null);
  };

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="flex size-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <Link2 size={16} />
        </span>
        <span className="text-[13px] font-medium text-[var(--ink)]">
          Add a photo from a link
        </span>
        <span className="text-[11px] text-[var(--ink-mute)]">
          A direct link to a {SUPPORTED_IMAGE_EXTENSIONS_LABEL} image.
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          autoFocus
          type="url"
          inputMode="url"
          value={link}
          placeholder="https://…/photo.jpg"
          aria-label="Photo link"
          aria-invalid={Boolean(error)}
          disabled={disabled}
          onChange={(event) => {
            setLink(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && onCancel) {
              event.preventDefault();
              onCancel();
              return;
            }
            if (event.key !== "Enter") return;
            event.preventDefault();
            applyLink();
          }}
        />
        <Button
          type="button"
          size="icon"
          onClick={applyLink}
          disabled={disabled || !link.trim()}
          title="Use this link"
          aria-label="Use this link"
          className="shrink-0"
        >
          <Check size={15} />
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
