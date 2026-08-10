import { describe, expect, it } from "vitest";
import { objectToRow, parseProductsCsv, parseProductsJson, rowToBulkItem } from "./importProductsCsv";

describe("rowToBulkItem", () => {
  it("reads aliased headers and strips currency characters from numbers", () => {
    const item = rowToBulkItem({
      title: "Blue Shirt",
      code: "BS-01",
      rate: "1,500",
      qty: "12",
      colour: "Blue",
    });
    expect(item.name).toBe("Blue Shirt");
    expect(item.sku).toBe("BS-01");
    expect(item.price).toBe(1500);
    expect(item.stock).toBe(12);
    expect(item.color).toBe("Blue");
  });

  it("defaults the category to Apparel and splits multi-value cells", () => {
    const item = rowToBulkItem({
      name: "Cap",
      price: "500",
      sizes: "S|M;L",
      images: "https://a.com/1.png, https://a.com/2.png",
    });
    expect(item.cat).toBe("Apparel");
    expect(item.sizes).toEqual(["S", "M", "L"]);
    expect(item.imageUrls).toEqual(["https://a.com/1.png", "https://a.com/2.png"]);
    expect(item.imageUrl).toBe("https://a.com/1.png");
  });

  it("leaves the discount undefined when the cell is empty", () => {
    expect(rowToBulkItem({ name: "X", price: "10" }).discountPercentage).toBeUndefined();
    expect(rowToBulkItem({ name: "X", price: "10", discount: "15%" }).discountPercentage).toBe(15);
  });
});

describe("parseProductsCsv", () => {
  it("parses rows and drops those without a name", () => {
    const items = parseProductsCsv("name,price,stock\nShirt,1500,5\n,999,1\nCap,500,2\n");
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.name)).toEqual(["Shirt", "Cap"]);
  });
});

describe("parseProductsJson", () => {
  it("accepts a bare array or a {products} wrapper", () => {
    const bare = parseProductsJson('[{"name":"A","price":100}]');
    expect(bare).toHaveLength(1);

    const wrapped = parseProductsJson('{"products":[{"name":"B","price":200,"imageUrls":["https://a.com/x.png"]}]}');
    expect(wrapped[0]?.name).toBe("B");
    expect(wrapped[0]?.imageUrls).toEqual(["https://a.com/x.png"]);
  });

  it("flattens arrays through objectToRow with pipe joins", () => {
    expect(objectToRow({ Sizes: ["S", "M"], name: "X" })).toEqual({ sizes: "S|M", name: "X" });
  });
});
