import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { DocErrorRow, DocFieldRow } from "../../utils/apiDocs.content";
import { CopyableCode } from "../CopyableCode";

export function DocSection({
  id,
  title,
  isSubsection = false,
  children,
}: {
  id: string;
  title: string;
  isSubsection?: boolean;
  children: ReactNode;
}) {
  const Heading = isSubsection ? "h3" : "h2";
  // The id sits on the heading so the TOC scroll-spy tracks headings, as the blog TOC does.
  return (
    <section className="flex flex-col gap-5">
      <Heading
        id={id}
        className={cn(
          "scroll-mt-6 font-semibold",
          isSubsection ? "text-xl" : "text-2xl",
        )}
      >
        {title}
      </Heading>
      {children}
    </section>
  );
}

export function DocSubsections({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex flex-col gap-14">{children}</div>;
}

export function DocParagraph({ children }: { children: ReactNode }) {
  return <p className="text-[15px] leading-7 text-[var(--ink-soft)]">{children}</p>;
}

export function DocList({ children }: { children: ReactNode }) {
  return (
    <ul className="flex list-disc flex-col gap-2.5 pl-5 text-[15px] leading-7 text-[var(--ink-soft)]">
      {children}
    </ul>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 font-mono text-sm text-[var(--ink)]">
      {children}
    </code>
  );
}

export function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium text-[var(--accent)] underline-offset-4 hover:underline"
    >
      {children}
    </a>
  );
}

export function DocLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mt-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
      {children}
    </p>
  );
}

export function EndpointLine({ method, url }: { method: "GET" | "POST"; url: string }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span
        className={cn(
          "inline-flex w-fit shrink-0 items-center rounded-md px-2.5 py-1 font-mono text-[13px] font-bold tracking-wide",
          method === "POST" ? "bg-info-soft text-info" : "bg-success-soft text-success",
        )}
      >
        {method}
      </span>
      <CopyableCode inline code={url} className="min-w-0 flex-1" />
    </div>
  );
}

function ReferenceTable({
  headings,
  children,
}: {
  headings: [string, string, string];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
      <table className="w-full min-w-[600px] text-left text-[15px]">
        <thead className="bg-[var(--surface-2)] text-[13px] uppercase tracking-wide text-[var(--ink-mute)]">
          <tr>
            {headings.map((heading) => (
              <th key={heading} className="px-4 py-3 font-semibold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--line-soft)]">{children}</tbody>
      </table>
    </div>
  );
}

export function FieldTable({ rows }: { rows: DocFieldRow[] }) {
  return (
    <ReferenceTable headings={["Field", "Required", "Description"]}>
      {rows.map((fieldRow) => (
        <tr key={fieldRow.field} className="align-top">
          <td className="whitespace-nowrap px-4 py-3.5">
            <code className="font-mono text-sm text-[var(--ink)]">{fieldRow.field}</code>
          </td>
          <td className="px-4 py-3.5">
            <span
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-xs font-semibold",
                fieldRow.isRequired
                  ? "bg-destructive-soft text-destructive"
                  : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
              )}
            >
              {fieldRow.isRequired ? "Required" : "Optional"}
            </span>
          </td>
          <td className="px-4 py-3.5 leading-7 text-[var(--ink-soft)]">
            {fieldRow.description}
          </td>
        </tr>
      ))}
    </ReferenceTable>
  );
}

export function ErrorTable({ rows }: { rows: DocErrorRow[] }) {
  return (
    <ReferenceTable headings={["Code", "Status", "Meaning"]}>
      {rows.map((errorRow) => (
        <tr key={errorRow.code} className="align-top">
          <td className="whitespace-nowrap px-4 py-3.5">
            <code className="font-mono text-sm text-[var(--ink)]">{errorRow.code}</code>
          </td>
          <td className="px-4 py-3.5">
            <span className="inline-flex rounded-md bg-destructive-soft px-2 py-0.5 font-mono text-xs font-semibold text-destructive">
              {errorRow.httpStatus}
            </span>
          </td>
          <td className="px-4 py-3.5 leading-7 text-[var(--ink-soft)]">{errorRow.meaning}</td>
        </tr>
      ))}
    </ReferenceTable>
  );
}
