"use client";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Link2 } from "lucide-react";
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
  disabled,
}: Readonly<{
  onSubmit: (url: string) => void;
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
    <div className="flex max-w-[300px] flex-col gap-1.5">
      <span className="text-[11px] text-[var(--ink-mute)]">
        Or paste a photo link
      </span>
      <div className="flex items-center gap-1.5">
        <Input
          value={link}
          placeholder="https://…/photo.jpg"
          disabled={disabled}
          onChange={(event) => {
            setLink(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            applyLink();
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={applyLink}
          disabled={disabled || !link.trim()}
          title="Use this link"
        >
          <Link2 size={15} />
        </Button>
      </div>
      {error && <p className="text-destructive text-[11px]">{error}</p>}
    </div>
  );
}
