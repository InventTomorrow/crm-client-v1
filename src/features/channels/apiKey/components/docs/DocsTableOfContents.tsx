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
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
        On this page
      </p>
      <ul className="flex flex-col border-l border-[var(--line)]">
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
        "-ml-px block border-l-2 py-1.5 text-[15px] no-underline transition-colors",
        isNested ? "pl-7" : "pl-4",
        isActive
          ? "border-[var(--accent)] font-medium text-[var(--accent)]"
          : "border-transparent text-[var(--ink-mute)] hover:border-[var(--ink-mute)] hover:text-[var(--ink)]",
      )}
    >
      {label}
    </a>
  );
}
