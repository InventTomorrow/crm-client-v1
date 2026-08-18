"use client";

import { Check, Link2, MessageCircle } from "lucide-react";
import { useState } from "react";

type ShareRowProps = {
  url: string;
  title: string;
};

const ACTION_CLASS =
  "inline-flex size-10 items-center justify-center rounded-full border border-brand-mint-2 bg-white text-brand-text transition-all hover:-translate-y-0.5 hover:border-brand-green/40 hover:text-brand-green";

export default function ShareRow({ url, title }: ShareRowProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the
      // WhatsApp link still works, so there is nothing to recover from.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-medium text-brand-text-soft">Share</span>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={ACTION_CLASS}
      >
        <MessageCircle className="size-4" />
      </a>

      <button
        type="button"
        onClick={copyLink}
        aria-label={hasCopied ? "Link copied" : "Copy link"}
        className={ACTION_CLASS}
      >
        {hasCopied ? (
          <Check className="size-4 text-brand-green" />
        ) : (
          <Link2 className="size-4" />
        )}
      </button>
    </div>
  );
}
