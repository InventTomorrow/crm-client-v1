import { ERROR_ROWS, ORDER_FIELD_ROWS } from "../../utils/apiDocs.content";
import {
  DocParagraph,
  DocSection,
  ErrorTable,
  FieldTable,
  InlineCode,
} from "./DocBlocks";

export function ReferenceDocs() {
  return (
    <>
      <DocSection id="rate-limits" title="Rate limits">
        <DocParagraph>
          Each API key can make <strong className="text-[var(--ink)]">60</strong>{" "}
          requests per minute. Going over returns status 429 — wait a moment
          and retry.
        </DocParagraph>
      </DocSection>

      <DocSection id="field-reference" title="Field reference">
        <DocParagraph>
          Every field the Create order endpoint accepts. Fields marked Required
          must be in the request body.
        </DocParagraph>
        <FieldTable rows={ORDER_FIELD_ROWS} />
      </DocSection>

      <DocSection id="errors" title="Error codes">
        <DocParagraph>
          Branch on <InlineCode>error.code</InlineCode>, not the message text —
          messages may be reworded, codes won&apos;t change.
        </DocParagraph>
        <ErrorTable rows={ERROR_ROWS} />
      </DocSection>
    </>
  );
}
