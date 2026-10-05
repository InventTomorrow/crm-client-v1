import {
  CREATE_ORDER_URL,
  GET_ORDER_URL,
  ORDER_LOOKUP_EXAMPLE,
  ORDER_LOOKUP_RESPONSE_EXAMPLE,
  ORDER_REQUEST_EXAMPLE,
  ORDER_RESPONSE_EXAMPLE,
} from "../../utils/apiDocs.content";
import { CopyableCode } from "../CopyableCode";
import {
  DocLabel,
  DocLink,
  DocList,
  DocParagraph,
  DocSection,
  DocSubsections,
  EndpointLine,
  InlineCode,
} from "./DocBlocks";

export function OrdersApiDocs() {
  return (
    <DocSection id="orders-api" title="Orders API">
      <DocParagraph>
        Create a CRM order when a customer confirms checkout on your website.
        The customer is added as a lead and gets an order confirmation on
        WhatsApp automatically.
      </DocParagraph>

      <DocSubsections>
        <DocSection id="create-order" title="Create an order" isSubsection>
          <EndpointLine method="POST" url={CREATE_ORDER_URL} />
          <DocParagraph>
            Safe to retry: sending the same <InlineCode>externalOrderId</InlineCode>{" "}
            again returns the original order with{" "}
            <InlineCode>&quot;duplicate&quot;: true</InlineCode> and status 200
            instead of 201. Every accepted field is listed in the{" "}
            <DocLink href="#field-reference">Field reference</DocLink>.
          </DocParagraph>
          <DocLabel>Request</DocLabel>
          <CopyableCode language="bash" code={ORDER_REQUEST_EXAMPLE} />
          <DocLabel>Response · 201</DocLabel>
          <CopyableCode language="json" code={ORDER_RESPONSE_EXAMPLE} />
        </DocSection>

        <DocSection
          id="confirmation-message"
          title="Custom WhatsApp message"
          isSubsection
        >
          <DocParagraph>
            When an order is created, the customer gets a WhatsApp message from
            your connected number. You choose what it says:
          </DocParagraph>
          <DocList>
            <li>
              Send <InlineCode>confirmationMessage</InlineCode> — your text is
              sent exactly as written.
            </li>
            <li>
              Leave it out (or send it blank) — an automatic receipt with the
              order number, items and total is sent instead.
            </li>
          </DocList>
          <DocParagraph>
            The message is saved to the customer&apos;s conversation in your
            inbox. It&apos;s sent once per order — retrying the same{" "}
            <InlineCode>externalOrderId</InlineCode> doesn&apos;t send it again.
            If WhatsApp isn&apos;t connected, the order is still created and no
            message is sent.
          </DocParagraph>
        </DocSection>

        <DocSection id="get-order" title="Look up an order" isSubsection>
          <EndpointLine method="GET" url={GET_ORDER_URL} />
          <DocParagraph>
            Fetch an order&apos;s current status using your own{" "}
            <InlineCode>externalOrderId</InlineCode>.
          </DocParagraph>
          <DocLabel>Request</DocLabel>
          <CopyableCode language="bash" code={ORDER_LOOKUP_EXAMPLE} />
          <DocLabel>Response · 200</DocLabel>
          <CopyableCode language="json" code={ORDER_LOOKUP_RESPONSE_EXAMPLE} />
        </DocSection>
      </DocSubsections>
    </DocSection>
  );
}
