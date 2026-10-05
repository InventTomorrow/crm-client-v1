import { DocList, DocParagraph, DocSection, InlineCode } from "./DocBlocks";

export function GettingStartedDocs() {
  return (
    <>
      <DocSection id="overview" title="Overview">
        <DocParagraph>
          The Website API lets your own systems talk to this CRM. Use the{" "}
          <strong className="text-[var(--ink)]">Orders API</strong> to create
          an order the moment a customer checks out. The customer gets an order
          confirmation on WhatsApp — your own message, or an automatic receipt.
        </DocParagraph>
        <DocParagraph>
          All requests and responses are JSON. A successful response always
          has <InlineCode>&quot;success&quot;: true</InlineCode> and a{" "}
          <InlineCode>data</InlineCode> object; a failed one has{" "}
          <InlineCode>&quot;success&quot;: false</InlineCode> and an{" "}
          <InlineCode>error</InlineCode> object with a <InlineCode>code</InlineCode>{" "}
          and <InlineCode>message</InlineCode>.
        </DocParagraph>
      </DocSection>

      <DocSection id="authentication" title="Authentication">
        <DocParagraph>
          Send your API key with every request, in either header:
        </DocParagraph>
        <DocList>
          <li>
            <InlineCode>Authorization: Bearer &lt;key&gt;</InlineCode>
          </li>
          <li>
            <InlineCode>X-Api-Key: &lt;key&gt;</InlineCode>
          </li>
        </DocList>
        <DocParagraph>
          Keep keys on your server. Never put them in browser code or a mobile
          app, where anyone can read them.
        </DocParagraph>
      </DocSection>

      <DocSection id="environments" title="Sandbox & Live keys">
        <DocList>
          <li>
            <InlineCode>sk_test_…</InlineCode>{" "}
            <strong className="text-[var(--ink)]">Sandbox</strong> — for
            building and testing. Orders are flagged as sandbox orders in the
            CRM.
          </li>
          <li>
            <InlineCode>sk_live_…</InlineCode>{" "}
            <strong className="text-[var(--ink)]">Live</strong> — creates real
            orders. Switch to it once your integration is tested.
          </li>
        </DocList>
        <DocParagraph>
          A key&apos;s mode can&apos;t be changed later — create a new Live key
          when you&apos;re ready to go live.
        </DocParagraph>
      </DocSection>
    </>
  );
}
