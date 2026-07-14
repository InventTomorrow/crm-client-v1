"use client";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import http from "react-syntax-highlighter/dist/esm/languages/hljs/http";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("json", json);
SyntaxHighlighter.registerLanguage("http", http);
SyntaxHighlighter.registerLanguage("bash", bash);

// react-syntax-highlighter's "github" style is already light; only one dark
// counterpart ships under a different name depending on version, so build a
// minimal github-dark palette locally to guarantee both themes are available.
const githubDark = {
  ...github,
  hljs: {
    ...github.hljs,
    background: "#0d1117",
    color: "#c9d1d9",
  },
  "hljs-attr": { color: "#79c0ff" },
  "hljs-string": { color: "#a5d6ff" },
  "hljs-number": { color: "#79c0ff" },
  "hljs-literal": { color: "#ff7b72" },
  "hljs-keyword": { color: "#ff7b72" },
  "hljs-punctuation": { color: "#c9d1d9" },
};

export function CopyableCode({
  code,
  className,
  language,
  inline = false,
}: {
  code: string;
  className?: string;
  /** Syntax-highlighted via highlight.js (through react-syntax-highlighter) when set. */
  language?: "json" | "http" | "bash";
  /** Single-line inline layout (e.g. a bare endpoint URL) instead of a multi-line block. */
  inline?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <div
        className={cn(
          "group flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-2.5",
          className,
        )}
      >
        <code className="flex-1 min-w-0 truncate font-mono text-[12.5px] text-[var(--ink)]">
          {code}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="flex shrink-0 items-center justify-center rounded-md p-1.5 text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          {copied ? (
            <Check size={13} className="text-[#15803D]" />
          ) : (
            <Copy size={13} />
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
      <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-2)] px-3.5 py-1.5">
        <span className="text-[10.5px] font-medium uppercase tracking-wider text-[var(--ink-mute)]">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-[var(--ink-mute)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink)]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#15803D]" /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language ?? "text"}
        style={isDark ? githubDark : github}
        customStyle={{
          margin: 0,
          padding: "0.875rem",
          fontSize: "12px",
          lineHeight: 1.6,
          background: "var(--surface)",
        }}
        codeTagProps={{ style: { fontFamily: "var(--font-mono)" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
