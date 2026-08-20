"use client";

import { useEffect, useState } from "react";
import type { TocEntry } from "../types";

/** Highlights the heading currently in view; ids are stamped by the server sanitizer. */
export default function TableOfContents({ entries }: { entries: TocEntry[] }) {
  const [activeId, setActiveId] = useState<string>(entries[0]?.id ?? "");

  useEffect(() => {
    const headings = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        for (const observed of observerEntries) {
          if (observed.isIntersecting) setActiveId(observed.target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length < 3) return null;

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-text-soft">
        On this page
      </p>
      <ul className="mt-4 space-y-1 border-l border-brand-mint-2 max-h-[calc(100vh-200px)] overflow-y-auto w-75 pr-1 toc-scrollbar">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === activeId ? "true" : undefined}
              className={`-ml-px block border-l-2 py-1.5 text-[14px] leading-snug transition-colors ${
                entry.level === 3 ? "pl-7" : "pl-4"
              } ${
                entry.id === activeId
                  ? "border-brand-green font-medium text-brand-green"
                  : "border-transparent text-brand-text hover:text-brand-dark"
              }`}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
