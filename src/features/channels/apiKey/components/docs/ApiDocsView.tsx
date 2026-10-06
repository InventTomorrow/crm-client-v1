"use client";
import { useActiveDocSection } from "../../hooks/useActiveDocSection";
import { DOC_SECTION_IDS } from "../../utils/apiDocs.content";
import { DocsTableOfContents } from "./DocsTableOfContents";
import { GettingStartedDocs } from "./GettingStartedDocs";
import { OrdersApiDocs } from "./OrdersApiDocs";
import { ReferenceDocs } from "./ReferenceDocs";

export function ApiDocsView() {
  const { activeSectionId, scrollToSection } = useActiveDocSection(DOC_SECTION_IDS);

  return (
    // Container query, not viewport: the app sidebar eats width, so the TOC column depends on the content area.
    <div className="@container">
      <div className="grid items-start gap-8 @4xl:grid-cols-[minmax(0,1fr)_240px]">
        {/* Top-level sections only (not the TOC <details>) get a divider above them. */}
        <article className="card flex min-w-0 flex-col gap-14 p-5 md:p-10 [&>section:not(:first-of-type)]:border-t [&>section:not(:first-of-type)]:border-[var(--line)] [&>section:not(:first-of-type)]:pt-14">
          <details className="rounded-xl border border-[var(--line)] p-4 @4xl:hidden">
            <summary className="cursor-pointer text-[15px] font-medium">
              Table of contents
            </summary>
            <div className="mt-4">
              <DocsTableOfContents
                activeSectionId={activeSectionId}
                onNavigate={scrollToSection}
              />
            </div>
          </details>

          <GettingStartedDocs />
          <OrdersApiDocs />
          <ReferenceDocs />
        </article>

        <aside className="sticky top-6 hidden max-h-[calc(100vh-8rem)] overflow-y-auto @4xl:block">
          <DocsTableOfContents
            activeSectionId={activeSectionId}
            onNavigate={scrollToSection}
          />
        </aside>
      </div>
    </div>
  );
}
