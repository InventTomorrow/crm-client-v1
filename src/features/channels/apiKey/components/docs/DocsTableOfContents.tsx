"use client";
import { cn } from "@/lib/utils";
import { DOC_TABLE_OF_CONTENTS } from "../../utils/apiDocs.content";

export function DocsTableOfContents({
  activeSectionId,
  onNavigate,
}: {
  activeSectionId: string | undefined;
  onNavigate: (sectionId: string) => void;
}) {
  return (
    <nav aria-label="On this page" className="flex flex-col">
      <p className="border-b border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
        On this page
      </p>
      <ul className="flex flex-col py-1">
        {DOC_TABLE_OF_CONTENTS.map((tocEntry) => (
          <li key={tocEntry.id}>
            <TocLink
              sectionId={tocEntry.id}
              label={tocEntry.label}
              isActive={activeSectionId === tocEntry.id}
              onNavigate={onNavigate}
            />
            {tocEntry.children && (
              <ul>
                {tocEntry.children.map((childEntry) => (
                  <li key={childEntry.id}>
                    <TocLink
                      sectionId={childEntry.id}
                      label={childEntry.label}
                      isActive={activeSectionId === childEntry.id}
                      isNested
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

function TocLink({
  sectionId,
  label,
  isActive,
  isNested = false,
  onNavigate,
}: {
  sectionId: string;
  label: string;
  isActive: boolean;
  isNested?: boolean;
  onNavigate: (sectionId: string) => void;
}) {
  return (
    <a
      href={`#${sectionId}`}
      aria-current={isActive ? "location" : undefined}
      onClick={(event) => {
        event.preventDefault();
        onNavigate(sectionId);
      }}
      className={cn(
        "block border-l-2 py-1.5 pr-3 text-[13.5px] no-underline transition-colors",
        isNested ? "pl-8" : "pl-4",
        isActive
          ? "border-[var(--accent)] bg-[var(--accent-soft)] font-semibold text-[var(--ink)]"
          : "border-transparent text-[var(--ink-mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
      )}
    >
      {label}
    </a>
  );
}
