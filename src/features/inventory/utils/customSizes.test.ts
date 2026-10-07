import { describe, expect, it } from "vitest";
import type { Product } from "../types";
import { getCustomSizesInCategory, mergeSizeLists } from "./customSizes";

const product = (overrides: Partial<Product>): Product => ({
  id: "product",
  name: "Product",
  sku: "",
  price: 1000,
  stock: 1,
  status: "in",
  cat: "Uncategorized",
  ...overrides,
});

describe("mergeSizeLists", () => {
  it("drops blanks and case-only twins, keeping the first spelling", () => {
    expect(mergeSizeLists(["500g", " 1kg "], ["500G", "", "2kg"])).toEqual(["500g", "1kg", "2kg"]);
  });
});

describe("getCustomSizesInCategory", () => {
  const products = [
    product({ cat: "Kitchen", sizes: ["500g", "One Size"] }),
    product({
      cat: " kitchen ",
      variants: [{ id: "v1", name: "Steel", sizes: ["12 inch", "500G"], price: 1000, stock: 2 }],
    }),
    product({ cat: "Apparel", sizes: ["Kids 4-5"] }),
  ];

  it("collects the seller's own sizes from products and variants in the same category", () => {
    expect(getCustomSizesInCategory(products, "Kitchen")).toEqual(["500g", "12 inch"]);
  });

  it("leaves out other categories and the built-in sizes", () => {
    expect(getCustomSizesInCategory(products, "Apparel")).toEqual(["Kids 4-5"]);
    expect(getCustomSizesInCategory(products, "Beauty")).toEqual([]);
  });

  it("treats a missing category as Uncategorized", () => {
    expect(getCustomSizesInCategory([product({ sizes: ["Large tray"] })], undefined)).toEqual(["Large tray"]);
  });
});
