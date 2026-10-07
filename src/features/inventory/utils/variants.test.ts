import { describe, expect, it } from "vitest";
import {
  describeVariantStock,
  formatPriceRange,
  getSuggestedVariantSkus,
  getVariantTotals,
  orderSizes,
} from "./variants";

describe("getVariantTotals", () => {
  it("takes the price range and total stock from the variants", () => {
    expect(
      getVariantTotals([
        { price: "8999", stock: "4" },
        { price: 9499, stock: 0 },
        { price: "", stock: "6" },
      ]),
    ).toEqual({ variantCount: 3, minPrice: 8999, maxPrice: 9499, totalStock: 10, soldOutCount: 1 });
  });

  it("never counts a stock that has not been typed yet as sold out", () => {
    const totals = getVariantTotals([{ price: "", stock: "" }, undefined]);

    expect(totals).toMatchObject({ minPrice: null, maxPrice: null, totalStock: 0, soldOutCount: 0 });
  });
});

describe("formatPriceRange", () => {
  it("shows one price, a range, or a dash when nothing is priced", () => {
    expect(formatPriceRange(8999, 8999)).toBe(`Rs. ${(8999).toLocaleString("en-PK")}`);
    expect(formatPriceRange(100, 250)).toBe("Rs. 100 – Rs. 250");
    expect(formatPriceRange(null, null)).toBe("—");
  });
});

describe("describeVariantStock", () => {
  it("counts the variants and flags sold-out ones", () => {
    expect(describeVariantStock(1, 0)).toBe("Across 1 variant");
    expect(describeVariantStock(3, 1)).toBe("Across 3 variants · 1 sold out");
  });
});

describe("getSuggestedVariantSkus", () => {
  it("builds product SKU + colour + size for blank variants only", () => {
    expect(
      getSuggestedVariantSkus("bs-006", [
        { color: "Red", sizes: ["XL"] },
        { sku: "CUSTOM-1", color: "Black", sizes: ["M"] },
        { color: "Navy Blue", sizes: ["EU 42"] },
      ]),
    ).toEqual(["BS-006-RED-XL", undefined, "BS-006-NAVY-BLUE-EU-42"]);
  });

  it("leaves the size out of a variant that comes in several", () => {
    expect(getSuggestedVariantSkus("BS-006", [{ color: "Red", sizes: ["S", "M"] }])).toEqual(["BS-006-RED"]);
  });

  it("numbers a variant with no colour or size, and never repeats a SKU", () => {
    expect(
      getSuggestedVariantSkus("BS-006", [
        {},
        { color: "Red", sizes: ["XL"] },
        { color: "red", sizes: ["xl"] },
        { sku: "bs-006-red-xl-3" },
      ]),
    ).toEqual(["BS-006-1", "BS-006-RED-XL", "BS-006-RED-XL-2", undefined]);
  });

  it("suggests nothing without a product SKU", () => {
    expect(getSuggestedVariantSkus("  ", [{ color: "Red" }])).toEqual([undefined]);
  });
});

describe("orderSizes", () => {
  it("puts known sizes in their natural order and keeps the seller's own last, as added", () => {
    expect(orderSizes(["XL", "500g", "S", "12 inch", "M"])).toEqual(["S", "M", "XL", "500g", "12 inch"]);
  });
});
