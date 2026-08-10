import { describe, expect, it } from "vitest";
import {
  BUSINESS_VERTICAL_VALUES,
  BUSINESS_VERTICALS,
  capabilitiesFor,
  getBusinessVerticalShortLabel,
  hasCapability,
} from "./business-verticals";

describe("business verticals", () => {
  it("keeps the Zod tuple in sync with the option list", () => {
    expect(BUSINESS_VERTICAL_VALUES).toEqual(BUSINESS_VERTICALS.map((v) => v.value));
  });

  it("maps each vertical to its capabilities, mirroring the server registry", () => {
    expect(capabilitiesFor("ECOMMERCE")).toEqual(["CATALOG_PRODUCTS", "ORDERS"]);
    expect(capabilitiesFor("RESTAURANT")).toEqual(["CATALOG_MENU", "ORDERS"]);
    expect(capabilitiesFor("MARKETING_AGENCY")).toEqual([
      "CATALOG_SERVICES",
      "QUALIFICATION",
      "BOOKINGS",
      "FOLLOW_UPS",
      "RESOURCES",
    ]);
  });

  it("hasCapability checks the vertical's list", () => {
    expect(hasCapability("ECOMMERCE", "ORDERS")).toBe(true);
    expect(hasCapability("MARKETING_AGENCY", "ORDERS")).toBe(false);
  });

  it("stays permissive before the tenant loads", () => {
    expect(hasCapability(undefined, "ORDERS")).toBe(true);
  });

  it("has a short label per vertical", () => {
    expect(getBusinessVerticalShortLabel("ECOMMERCE")).toBe("Retail");
    expect(getBusinessVerticalShortLabel("MARKETING_AGENCY")).toBe("Agency");
  });
});
