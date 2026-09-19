import { describe, expect, it } from "vitest";
import { serviceOfferingFormSchema, type ServiceOffering } from "../types";
import { buildEmptyPlan, toServiceFormValues, toServicePayload } from "./serviceFormMapping";

const base = {
  name: "Social Media Management",
  shortDescription: "Content and ads",
  deliveryType: "MONTHLY_RETAINER" as const,
  pricingType: "TIERED" as const,
};

const priced = { ...buildEmptyPlan(0), name: "Growth", price: 50000 };
const quote = { ...buildEmptyPlan(1), name: "Enterprise", isCustomQuote: true };

describe("service close mode", () => {
  it("closes on a call unless the owner turns chat on", () => {
    const parsed = serviceOfferingFormSchema.parse({ ...base, plans: [priced] });
    expect(parsed.closeMode).toBe("CALL");
  });

  it("closes in chat only with a priced plan, matching the server rule", () => {
    const noPrice = serviceOfferingFormSchema.safeParse({
      ...base,
      closeMode: "CHAT",
      plans: [quote],
    });
    expect(noPrice.success).toBe(false);
    expect(noPrice.error?.issues[0]?.path).toEqual(["closeMode"]);

    const withPrice = serviceOfferingFormSchema.safeParse({
      ...base,
      closeMode: "CHAT",
      plans: [priced, quote],
    });
    expect(withPrice.success).toBe(true);
  });

  it("round-trips the toggle through the form", () => {
    const service = {
      ...base,
      id: "s1",
      tenantId: "t1",
      currency: "PKR",
      platformsCovered: [],
      keyOutcomes: [],
      imageUrls: [],
      plans: [{ ...priced, deliverables: null }],
      closeMode: "CHAT",
      isActive: true,
      displayOrder: 0,
      createdAt: "",
      updatedAt: "",
    } satisfies ServiceOffering;

    const values = toServiceFormValues(service);
    expect(values.closeMode).toBe("CHAT");

    const payload = toServicePayload(serviceOfferingFormSchema.parse(values));
    expect(payload.closeMode).toBe("CHAT");
  });
});
