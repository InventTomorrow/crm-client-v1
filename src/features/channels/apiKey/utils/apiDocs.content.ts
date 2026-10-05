const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "";

export const CREATE_ORDER_URL = `${API_ORIGIN}/api/v1/external/orders`;
export const GET_ORDER_URL = `${API_ORIGIN}/api/v1/external/orders/:externalOrderId`;

export interface DocTocEntry {
  id: string;
  label: string;
  children?: { id: string; label: string }[];
}

export const DOC_TABLE_OF_CONTENTS: DocTocEntry[] = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "environments", label: "Sandbox & Live keys" },
  {
    id: "orders-api",
    label: "Orders API",
    children: [
      { id: "create-order", label: "Create an order" },
      { id: "confirmation-message", label: "Custom WhatsApp message" },
      { id: "get-order", label: "Look up an order" },
    ],
  },
  { id: "rate-limits", label: "Rate limits" },
  { id: "field-reference", label: "Field reference" },
  { id: "errors", label: "Error codes" },
];

export const DOC_SECTION_IDS: string[] = DOC_TABLE_OF_CONTENTS.flatMap(
  (entry) => [entry.id, ...(entry.children ?? []).map((child) => child.id)],
);

export interface DocFieldRow {
  field: string;
  isRequired: boolean;
  description: string;
}

export interface DocErrorRow {
  code: string;
  httpStatus: number;
  meaning: string;
}

export const ORDER_FIELD_ROWS: DocFieldRow[] = [
  {
    field: "externalOrderId",
    isRequired: true,
    description:
      "Your own unique ID for this order. Sending the same ID twice returns the original order instead of creating a duplicate, so retries are safe.",
  },
  {
    field: "currency",
    isRequired: false,
    description: 'Three-letter currency code such as "PKR". Defaults to "USD".',
  },
  {
    field: "notes",
    isRequired: false,
    description: "Free-text note attached to the order.",
  },
  {
    field: "confirmationMessage",
    isRequired: false,
    description:
      "Your own WhatsApp message to the customer, sent instead of the automatic receipt. Up to 4,000 characters. Leave it out to send the automatic receipt.",
  },
  {
    field: "customer.name",
    isRequired: true,
    description: "Full name of the customer.",
  },
  {
    field: "customer.phone",
    isRequired: true,
    description:
      "Phone number with country code. The order confirmation is sent to this number on WhatsApp.",
  },
  {
    field: "customer.email",
    isRequired: false,
    description: "Customer's email address.",
  },
  {
    field: "items",
    isRequired: true,
    description: "Products in the order — at least one.",
  },
  {
    field: "items[].name",
    isRequired: true,
    description: "Product name shown to the customer and in the CRM.",
  },
  {
    field: "items[].sku",
    isRequired: false,
    description: "Your internal product code.",
  },
  {
    field: "items[].imageUrl",
    isRequired: false,
    description: "Product image URL shown next to the item in the CRM.",
  },
  {
    field: "items[].quantity",
    isRequired: true,
    description: "Whole number, 1 or more.",
  },
  {
    field: "items[].unitPrice",
    isRequired: true,
    description: "Price per unit in the order currency. Can't be negative.",
  },
  {
    field: "shipping.addressLine1",
    isRequired: true,
    description: "House or building number and street.",
  },
  {
    field: "shipping.addressLine2",
    isRequired: false,
    description: "Apartment, suite, floor or unit.",
  },
  { field: "shipping.city", isRequired: false, description: "City." },
  { field: "shipping.state", isRequired: false, description: "State or province." },
  { field: "shipping.postalCode", isRequired: false, description: "ZIP or postal code." },
  {
    field: "shipping.country",
    isRequired: false,
    description: 'Defaults to "PK" (Pakistan).',
  },
  {
    field: "shipping.notes",
    isRequired: false,
    description: "Delivery instructions for this address.",
  },
];

export const ERROR_ROWS: DocErrorRow[] = [
  {
    code: "auth/api_key_missing",
    httpStatus: 401,
    meaning: "No Authorization or X-Api-Key header was sent.",
  },
  {
    code: "auth/api_key_invalid",
    httpStatus: 401,
    meaning: "The key doesn't match an active key, or it has been revoked.",
  },
  {
    code: "validation/bad_request",
    httpStatus: 400,
    meaning: "A field failed validation — see error.details for the exact field(s).",
  },
  {
    code: "common/not_found",
    httpStatus: 404,
    meaning: "Order lookup: no order exists for that externalOrderId.",
  },
  {
    code: "common/rate_limit_exceeded",
    httpStatus: 429,
    meaning: "Too many requests for this key in the current minute. Back off and retry.",
  },
];

export const ORDER_REQUEST_EXAMPLE = `curl -X POST ${CREATE_ORDER_URL} \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "externalOrderId": "shopify-1042",
    "currency": "PKR",
    "confirmationMessage": "Hi Jane, thanks for your order! It ships within 2 days.",
    "customer": { "name": "Jane Doe", "phone": "+923000000000" },
    "items": [{ "name": "Classic Tee", "sku": "TEE-BLK-M", "quantity": 2, "unitPrice": 1999 }],
    "shipping": { "addressLine1": "221B Baker Street", "city": "Karachi" }
  }'`;

export const ORDER_RESPONSE_EXAMPLE = `{
  "success": true,
  "data": {
    "orderId": "665f1c2e9a1b2c3d4e5f6789",
    "orderNumber": 1042,
    "status": "CONFIRMED",
    "duplicate": false
  }
}`;

export const ORDER_LOOKUP_EXAMPLE = `curl ${CREATE_ORDER_URL}/shopify-1042 \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY"`;

export const ORDER_LOOKUP_RESPONSE_EXAMPLE = `{
  "success": true,
  "data": {
    "orderId": "665f1c2e9a1b2c3d4e5f6789",
    "orderNumber": 1042,
    "status": "CONFIRMED",
    "currency": "PKR",
    "total": 3998,
    "items": [{ "name": "Classic Tee", "quantity": 2, "unitPrice": 1999 }]
  }
}`;
