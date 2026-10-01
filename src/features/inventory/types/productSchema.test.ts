import { describe, expect, it } from "vitest";
import { getSizeGroupsForCategory, getVariantLabel, productSchema } from "./index";

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

  describe("variants", () => {
    const variant = { name: "Maroon, Large", size: "L", color: "Maroon", price: "9499", stock: "4" };

    it("defaults to none and coerces a variant's price and stock", () => {
      expect(productSchema.parse(valid).variants).toEqual([]);
      const parsed = productSchema.parse({ ...valid, variants: [variant] });
      expect(parsed.variants[0]).toMatchObject({ name: "Maroon, Large", price: 9499, stock: 4 });
    });

    it("leaves the name optional but needs a positive price on every variant", () => {
      expect(productSchema.safeParse({ ...valid, variants: [{ ...variant, name: "" }] }).success).toBe(true);
      expect(productSchema.safeParse({ ...valid, variants: [{ ...variant, price: "0" }] }).success).toBe(false);
    });

    it("labels a nameless variant by colour and size, then by the product name", () => {
      expect(getVariantLabel({ name: " Eid Edition " }, "Lawn Suit")).toBe("Eid Edition");
      expect(getVariantLabel({ name: "", color: "Maroon", size: "L" }, "Lawn Suit")).toBe("Maroon / L");
      expect(getVariantLabel({ size: "XL" }, "Lawn Suit")).toBe("XL");
      expect(getVariantLabel({}, "Lawn Suit ")).toBe("Lawn Suit");
    });

    it("rejects fractional or negative variant stock", () => {
      expect(productSchema.safeParse({ ...valid, variants: [{ ...variant, stock: "1.5" }] }).success).toBe(false);
      expect(productSchema.safeParse({ ...valid, variants: [{ ...variant, stock: "-1" }] }).success).toBe(false);
    });
  });
});
