import { describe, expect, it } from "vitest";
import type { ServicePlanFormData } from "../types";
import { validatePlanDraft } from "./servicePlanValidation";

const draft = (overrides: Partial<ServicePlanFormData> = {}): ServicePlanFormData =>
  ({
    key: "tier-1",
    name: "Starter",
    price: 10000,
    isCustomQuote: false,
    ...overrides,
  }) as ServicePlanFormData;

describe("validatePlanDraft", () => {
  it("passes a named, priced tier", () => {
    expect(validatePlanDraft(draft())).toEqual({});
  });

  it("requires a non-blank name", () => {
    expect(validatePlanDraft(draft({ name: "   " })).name).toBeDefined();
  });

  it("requires a positive price unless the tier is a custom quote", () => {
    expect(validatePlanDraft(draft({ price: null })).price).toBeDefined();
    expect(validatePlanDraft(draft({ price: 0 })).price).toBeDefined();
    expect(validatePlanDraft(draft({ price: null, isCustomQuote: true }))).toEqual({});
  });
});
