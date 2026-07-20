"use client";
import { cn } from "@/lib/utils";
import { KeyRound, ShieldCheck, Terminal } from "lucide-react";
import { CopyableCode } from "./CopyableCode";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";
const CREATE_ORDER_URL = `${API_ORIGIN}/api/v1/external/orders`;
const GET_ORDER_URL = `${API_ORIGIN}/api/v1/external/orders/:externalOrderId`;

const EXAMPLE_REQUEST_HEADERS = `POST ${CREATE_ORDER_URL}
Authorization: Bearer sk_live_YOUR_API_KEY_HERE
Content-Type: application/json`;

const EXAMPLE_REQUEST_BODY = `{
  "externalOrderId": "shopify-1042",
  "currency": "PKR",
  "notes": "Leave at the front desk",
  "customer": {
    "name": "Jane Doe",
    "phone": "+923000000000",
    "email": "jane@example.com"
  },
  "items": [
    { "name": "Classic Tee", "sku": "TEE-BLK-M", "quantity": 2, "unitPrice": 1999 }
  ],
  "shipping": {
    "addressLine1": "221B Baker Street",
    "city": "Karachi",
    "country": "Pakistan"
  }
}`;

const CURL_EXAMPLE = `curl -X POST ${CREATE_ORDER_URL} \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY_HERE" \\
  -H "Content-Type: application/json" \\
  -d '{
    "externalOrderId": "shopify-1042",
    "currency": "PKR",
    "notes": "Leave at the front desk",
    "customer": {
      "name": "Jane Doe",
      "phone": "+923000000000",
      "email": "jane@example.com"
    },
    "items": [
      { "name": "Classic Tee", "sku": "TEE-BLK-M", "quantity": 2, "unitPrice": 1999 }
    ],
    "shipping": {
      "addressLine1": "221B Baker Street",
      "city": "Karachi",
      "country": "Pakistan"
    }
  }'`;

const EXAMPLE_RESPONSE = `{
  "success": true,
  "data": {
    "orderId": "665f1c2e9a1b2c3d4e5f6789",
    "orderNumber": 1042,
    "status": "CONFIRMED",
    "duplicate": false
  }
}`;

const FIELD_ROWS: {
  field: string;
  required: boolean;
  description: string;
}[] = [
  {
    field: "externalOrderId",
    required: true,
    description:
      "Your own unique ID for this order (e.g. your cart or database ID). Sending the same ID twice returns the original order instead of creating a duplicate — this is what makes the endpoint safe to retry.",
  },
  {
    field: "currency",
    required: false,
    description:
      "3-letter currency code, e.g. \"PKR\" or \"USD\". Defaults to \"USD\" if left out.",
  },
  {
    field: "notes",
    required: false,
    description: "Free-text note attached to the order, e.g. delivery instructions.",
  },
  {
    field: "customer.name",
    required: true,
    description: "Full name of the customer placing the order.",
  },
  {
    field: "customer.phone",
    required: true,
    description:
      "Customer's phone number, including country code. Used to message them on WhatsApp about their order status.",
  },
  {
    field: "customer.email",
    required: false,
    description: "Customer's email. If provided, they also get an email receipt.",
  },
  {
    field: "items",
    required: true,
    description: "List of products in the order. Must contain at least one item.",
  },
  {
    field: "items[].name",
    required: true,
    description: "Product name, shown to the customer and in the CRM.",
  },
  {
    field: "items[].sku",
    required: false,
    description: "Your internal product code — useful for matching this line item to your inventory.",
  },
  {
    field: "items[].imageUrl",
    required: false,
    description: "URL of a product image, shown alongside the item in the CRM.",
  },
  {
    field: "items[].quantity",
    required: true,
    description: "How many units of this product were ordered. Whole number, 1 or more.",
  },
  {
    field: "items[].unitPrice",
    required: true,
    description: "Price per unit, in your chosen currency (e.g. 1999 for PKR 1,999). Can't be negative.",
  },
  {
    field: "shipping.addressLine1",
    required: true,
    description: "Street address — house/building number and street name.",
  },
  {
    field: "shipping.addressLine2",
    required: false,
    description: "Apartment, suite, floor, or unit number.",
  },
  {
    field: "shipping.city",
    required: false,
    description: "City name.",
  },
  {
    field: "shipping.state",
    required: false,
    description: "State or province.",
  },
  {
    field: "shipping.postalCode",
    required: false,
    description: "ZIP or postal code.",
  },
  {
    field: "shipping.country",
    required: false,
    description: "Defaults to \"PK\" (Pakistan) if left out.",
  },
  {
    field: "shipping.notes",
    required: false,
    description: "Delivery instructions specific to this address, e.g. \"Leave at the front desk\".",
  },
];

const ERROR_ROWS: { code: string; status: number; meaning: string }[] = [
  {
    code: "auth/api_key_missing",
    status: 401,
    meaning: "No Authorization/X-Api-Key header was sent.",
  },
  {
    code: "auth/api_key_invalid",
    status: 401,
    meaning: "The key doesn't match any active key, or was typed wrong.",
  },
  {
    code: "auth/api_key_revoked",
    status: 401,
    meaning: "The key exists but has been revoked.",
  },
  {
    code: "validation/bad_request",
    status: 400,
    meaning:
      "One or more fields failed validation — see error.details for the exact field(s).",
  },
  {
    code: "common/rate_limit_exceeded",
    status: 429,
    meaning:
      "Too many requests for this key in the current window — back off and retry.",
  },
  {
    code: "common/not_found",
    status: 404,
    meaning: "GET lookup: no order exists for that externalOrderId.",
  },
];

function StatusPill({ status }: { status: number }) {
  const isError = status >= 400;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold",
        isError
          ? "bg-[#FEE2E2] text-[#991B1B]"
          : "bg-[#DCFCE7] text-[#15803D]",
      )}
    >
      {status}
    </span>
  );
}

function RequiredPill({ required }: { required: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold",
        required
          ? "bg-[#FEE2E2] text-[#991B1B]"
          : "bg-[var(--surface-2)] text-[var(--ink-mute)]",
      )}
    >
      {required ? "Required" : "Optional"}
    </span>
  );
}

function MethodPill({ method }: { method: "POST" | "GET" }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide",
        method === "POST"
          ? "bg-[#DBEAFE] text-[#1E40AF]"
          : "bg-[#DCFCE7] text-[#15803D]",
      )}
    >
      {method}
    </span>
  );
}

function DocSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof KeyRound;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2.5">
      <h4 className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ink)]">
        {Icon && <Icon size={14} className="text-[var(--accent)]" />}
        {title}
      </h4>
      {children}
    </section>
  );
}

export function ApiDocsPanel() {
  return (
    <div className="flex flex-col gap-6 text-[13px] leading-relaxed">
      <p className="text-[var(--ink-mute)]">
        New here? This is everything you need to send orders from your
        website into this CRM. In short: your website calls the{" "}
        <strong className="text-[var(--ink)]">Create order</strong> endpoint
        below whenever a customer checks out, and the customer automatically
        gets notified on WhatsApp/email — no extra work on your side.
      </p>

      <DocSection title="Endpoints">
        <p className="text-[var(--ink-mute)]">
          Call <strong className="text-[var(--ink)]">Create / confirm an order</strong>{" "}
          the moment a customer confirms checkout on your website. Every
          request needs a valid API key (see Authentication below).
        </p>
        <p className="text-[var(--ink-mute)]">
          It&apos;s safe to call more than once for the same order — sending
          the same{" "}
          <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[12px]">
            externalOrderId
          </code>{" "}
          twice just returns the order you already created instead of making
          a duplicate. This means you don&apos;t need to worry about retries
          or double-clicks on your side.
        </p>

        <div className="flex flex-col gap-2.5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <MethodPill method="POST" />
              <span className="text-[12px] font-medium text-[var(--ink-soft)]">
                Create / confirm an order
              </span>
            </div>
            <CopyableCode inline code={CREATE_ORDER_URL} />
          </div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <MethodPill method="GET" />
              <span className="text-[12px] font-medium text-[var(--ink-soft)]">
                Look up order status
              </span>
            </div>
            <CopyableCode inline code={GET_ORDER_URL} />
          </div>
        </div>
      </DocSection>

      <DocSection title="Authentication" icon={ShieldCheck}>
        <p className="text-[var(--ink-mute)]">
          Every request must include your API key in one of these two
          headers:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-mute)]">
          <li>
            <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[12px]">
              Authorization: Bearer &lt;key&gt;
            </code>
          </li>
          <li>
            <code className="rounded bg-[var(--surface-2)] px-1 py-0.5 font-mono text-[12px]">
              X-Api-Key: &lt;key&gt;
            </code>
          </li>
        </ul>
        <p className="text-[var(--ink-mute)]">
          There are two kinds of keys — use the right one for what
          you&apos;re doing:
        </p>
        <ul className="list-disc space-y-1 pl-5 text-[var(--ink-mute)]">
          <li>
            <code className="font-mono text-[12px]">sk_test_…</code>{" "}
            (Sandbox) — for testing your integration. Never notifies real
            customers.
          </li>
          <li>
            <code className="font-mono text-[12px]">sk_live_…</code> (Live) —
            creates real orders and sends real WhatsApp/email receipts. Only
            use this once your integration is fully tested.
          </li>
        </ul>
        <p className="text-[var(--ink-mute)]">
          A key&apos;s mode can&apos;t be changed after it&apos;s created —
          create a new Live key when you&apos;re ready to go live.
        </p>
      </DocSection>

      <DocSection title="Fields" icon={KeyRound}>
        <p className="text-[var(--ink-mute)]">
          These are all the fields the{" "}
          <strong className="text-[var(--ink)]">Create order</strong>{" "}
          endpoint accepts. By default, every field is{" "}
          <strong className="text-[var(--ink)]">required</strong> unless it&apos;s
          marked Optional below.
        </p>
        <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-[190px_90px_1fr] gap-3 bg-[var(--surface-2)] px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
              <span>Field</span>
              <span>Required?</span>
              <span>Why it&apos;s needed</span>
            </div>
            {FIELD_ROWS.map((row, i) => (
              <div
                key={row.field}
                className={cn(
                  "grid grid-cols-[190px_90px_1fr] items-start gap-3 px-3.5 py-2.5 text-[12px]",
                  i !== FIELD_ROWS.length - 1 &&
                    "border-b border-[var(--line-soft)]",
                )}
              >
                <code className="font-mono text-[11.5px] text-[var(--ink)]">
                  {row.field}
                </code>
                <RequiredPill required={row.required} />
                <span className="text-[var(--ink-mute)]">
                  {row.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection title="Example request" icon={KeyRound}>
        <p className="text-[var(--ink-mute)]">
          Here&apos;s what a full request looks like, headers and all — use
          it as a template.
        </p>
        <div className="flex flex-col gap-2.5">
          <CopyableCode language="http" code={EXAMPLE_REQUEST_HEADERS} />
          <CopyableCode language="json" code={EXAMPLE_REQUEST_BODY} />
        </div>
      </DocSection>

      <DocSection title="Try it with cURL" icon={Terminal}>
        <p className="text-[var(--ink-mute)]">
          Not ready to write code yet? Copy this, swap in one of your own API
          keys, and run it in a terminal to see a real order get created
          before you wire up your integration.
        </p>
        <CopyableCode language="bash" code={CURL_EXAMPLE} />
      </DocSection>

      <DocSection title="Example response">
        <p className="text-[var(--ink-mute)]">
          A successful request returns the new order&apos;s ID and status
          like this:
        </p>
        <CopyableCode language="json" code={EXAMPLE_RESPONSE} />
      </DocSection>

      <DocSection title="Error codes">
        <p className="text-[var(--ink-mute)]">
          If something&apos;s wrong with the request, you&apos;ll get one of
          these back instead of a success response:
        </p>
        <div className="overflow-x-auto rounded-lg border border-[var(--line)]">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[200px_70px_1fr] gap-3 bg-[var(--surface-2)] px-3.5 py-2 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
              <span>Code</span>
              <span>Status</span>
              <span>Meaning</span>
            </div>
            {ERROR_ROWS.map((row, i) => (
              <div
                key={row.code}
                className={cn(
                  "grid grid-cols-[200px_70px_1fr] items-center gap-3 px-3.5 py-2.5 text-[12px]",
                  i !== ERROR_ROWS.length - 1 && "border-b border-[var(--line-soft)]",
                )}
              >
                <code className="font-mono text-[11.5px] text-[var(--ink)]">
                  {row.code}
                </code>
                <StatusPill status={row.status} />
                <span className="text-[var(--ink-mute)]">{row.meaning}</span>
              </div>
            ))}
          </div>
        </div>
      </DocSection>
    </div>
  );
}
