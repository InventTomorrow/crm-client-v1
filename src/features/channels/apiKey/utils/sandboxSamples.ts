// Placeholder contact details on purpose — never a real person's number or email.
export function buildSampleOrderPayloadText(): string {
  const sampleOrderPayload = {
    externalOrderId: `sandbox-${Date.now()}`,
    currency: "PKR",
    notes: "Sandbox test order",
    confirmationMessage:
      "Hi Test Customer, thanks for your order! We'll share delivery updates here.",
    customer: {
      name: "Test Customer",
      phone: "+923000000000",
      email: "customer@example.com",
    },
    items: [{ name: "Sample Item", quantity: 1, unitPrice: 999 }],
    shipping: {
      addressLine1: "123 Test Street",
      city: "Karachi",
      country: "PK",
    },
  };
  return JSON.stringify(sampleOrderPayload, null, 2);
}
