"use client";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import http from "react-syntax-highlighter/dist/esm/languages/hljs/http";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("http", http);
SyntaxHighlighter.registerLanguage("bash", bash);

// Colours come from --code-* tokens, so the palette flips with the `dark` class instead of a JS theme check.
const TOKEN_SYNTAX_THEME: Record<string, CSSProperties> = {
  hljs: { display: "block", overflowX: "auto", color: "var(--code-text)" },
  "hljs-attr": { color: "var(--code-key)" },
  "hljs-attribute": { color: "var(--code-key)" },
  "hljs-string": { color: "var(--code-string)" },
  "hljs-number": { color: "var(--code-number)" },
  "hljs-variable": { color: "var(--code-number)" },
  "hljs-literal": { color: "var(--code-keyword)" },
  "hljs-keyword": { color: "var(--code-keyword)", fontWeight: 600 },
  "hljs-built_in": { color: "var(--code-keyword)" },
  "hljs-meta": { color: "var(--code-comment)" },
  "hljs-comment": { color: "var(--code-comment)", fontStyle: "italic" },
  "hljs-punctuation": { color: "var(--code-punctuation)" },
};

export function CopyableCode({
  code,
  className,
  language,
  inline = false,
}: {
  code: string;
  className?: string;
  language?: "json" | "http" | "bash";
  /** Single-line layout for a bare value such as an endpoint URL. */
  inline?: boolean;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5",
          className,
        )}
      >
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-[var(--ink)]">
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          {isCopied ? (
            <Check size={14} className="text-success" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-[var(--line)]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--ink-mute)]">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          {isCopied ? (
            <>
              <Check size={13} className="text-success" /> Copied
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language ?? "text"}
        style={TOKEN_SYNTAX_THEME}
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "14px",
          lineHeight: 1.7,
          background: "var(--surface)",
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
