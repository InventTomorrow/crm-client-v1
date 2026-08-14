import { describe, expect, it } from "vitest";
import { getSizeGroupsForCategory, productSchema } from "./index";

describe("getSizeGroupsForCategory", () => {
  it("maps apparel to clothing sizes, case- and whitespace-insensitively", () => {
    expect(getSizeGroupsForCategory("Apparel")[0]?.label).toBe("Clothing");
    expect(getSizeGroupsForCategory("  APPAREL ")[0]?.label).toBe("Clothing");
  });

  it("maps footwear to EU shoe sizes", () => {
    expect(getSizeGroupsForCategory("Footwear")[0]?.label).toBe("Footwear (EU)");
  });

  it("falls back to general sizes for everything else", () => {
    expect(getSizeGroupsForCategory("Electronics")[0]?.label).toBe("General");
    expect(getSizeGroupsForCategory(undefined)[0]?.label).toBe("General");
  });
});

describe("productSchema", () => {
  const valid = { name: "Shirt", price: 1500, stock: 5 };

  it("accepts a minimal product and coerces numeric strings", () => {
    expect(productSchema.safeParse(valid).success).toBe(true);
    const coerced = productSchema.parse({ name: "Shirt", price: "1500", stock: "5" });
    expect(coerced.price).toBe(1500);
    expect(coerced.stock).toBe(5);
  });

  it("rejects a non-positive price and out-of-range discount", () => {
    expect(productSchema.safeParse({ ...valid, price: 0 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, discountPercentage: 101 }).success).toBe(false);
    expect(productSchema.safeParse({ ...valid, discountPercentage: 50 }).success).toBe(true);
  });

  it("rejects negative stock", () => {
    expect(productSchema.safeParse({ ...valid, stock: -1 }).success).toBe(false);
  });
});
