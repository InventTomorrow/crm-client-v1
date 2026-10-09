import { describe, expect, it } from "vitest";
import type { Product } from "@/features/inventory/types";
import type { Order } from "../types";
import { getOrderFormSchema } from "../validations.order";
import {
  getCatalogLineIndex,
  getCatalogLineOptions,
  getLineCatalogMatch,
  getLineSizeFromName,
  getOrderLineName,
} from "./catalogLineOptions";
import {
  getLeadContact,
  getNewOrderFormValues,
  getSavedOrderFormValues,
  haveOrderLinesChanged,
  toCreateOrderPayload,
  toUpdateOrderPayload,
} from "./orderFormPayload";

const shirt: Product = {
  id: "p1",
  name: "Linen Shirt",
  sku: "LS-1",
  price: 2500,
  stock: 9,
  status: "in",
  cat: "Shirts",
  imageUrls: ["https://cdn.test/shirt.jpg"],
  variants: [
    { id: "v1", name: "Black", sizes: ["L", "S", "M"], sku: "LS-1-BLK", price: 2700, stock: 4 },
    { id: "v2", name: "", color: "White", sizes: ["M"], price: 2500, stock: 0 },
  ],
};

const scarf: Product = {
  id: "p2",
  name: "Silk Scarf",
  sku: "",
  price: 900,
  stock: 3,
  status: "low",
  cat: "Accessories",
};

const deliveryValues = {
  customerName: "Ayesha Khan",
  customerPhone: "+92 300 1234567",
  email: "",
  addressLine1: "House 12, Street 4",
  addressLine2: "",
  city: "Lahore",
  state: "",
  postalCode: "",
  country: "PK",
  notes: "",
};

describe("getCatalogLineOptions", () => {
  it("offers each variant on its own, and a product without variants as one line", () => {
    const options = getCatalogLineOptions([shirt, scarf]);

    expect(options.map((option) => option.optionId)).toEqual([
      "variant:v1",
      "variant:v2",
      "product:p2",
    ]);
    expect(options[0]).toMatchObject({
      variantLabel: "Black",
      price: 2700,
      sku: "LS-1-BLK",
      sizes: ["S", "M", "L"],
      imageUrl: "https://cdn.test/shirt.jpg",
    });
    expect(options[1]).toMatchObject({ variantLabel: "White / M", stock: 0 });
    expect(options[2]).toMatchObject({ sku: undefined, price: 900 });
    expect(options[2]?.variantLabel).toBeUndefined();
  });
});

describe("getOrderLineName", () => {
  it("names the line the way the assistant does", () => {
    expect(getOrderLineName({ productName: "Linen Shirt", variantLabel: "Black" }, "M")).toBe(
      "Linen Shirt (Black / M)",
    );
    expect(getOrderLineName({ productName: "Silk Scarf" }, "")).toBe("Silk Scarf");
  });
});

describe("getLineCatalogMatch", () => {
  const options = getCatalogLineOptions([shirt, scarf]);
  const catalogIndex = getCatalogLineIndex(options);

  it("matches a line exactly by its variant and reads the size back from its name", () => {
    const match = getLineCatalogMatch(
      { productId: "p1", variantId: "v1", name: "Linen Shirt (Black / M)" },
      catalogIndex,
    );
    expect(match.option?.optionId).toBe("variant:v1");
    expect(match.highlightedOptionIds).toEqual(["variant:v1"]);
    expect(getLineSizeFromName(match.option!, "Linen Shirt (Black / M)")).toBe("M");
  });

  it("highlights the product's rows for a line saved with only the product id", () => {
    const match = getLineCatalogMatch(
      { productId: "p1", name: "Linen Shirt (XL)", imageUrl: "https://cdn.test/saved.jpg" },
      catalogIndex,
    );
    expect(match.option).toBeUndefined();
    expect(match.highlightedOptionIds).toEqual(["variant:v1", "variant:v2"]);
    expect(match.imageUrl).toBe("https://cdn.test/saved.jpg");
  });

  it("narrows to the variant the saved name points at, and falls back to the cover image", () => {
    const match = getLineCatalogMatch({ productId: "p1", name: "Linen Shirt (Black / L)" }, catalogIndex);
    expect(match.option).toBeUndefined();
    expect(match.highlightedOptionIds).toEqual(["variant:v1"]);

    const unnamed = getLineCatalogMatch({ productId: "p1", name: "Linen Shirt (XL)" }, catalogIndex);
    expect(unnamed.imageUrl).toBe("https://cdn.test/shirt.jpg");
  });

  it("has nothing to highlight for a product the catalog no longer has", () => {
    expect(getLineCatalogMatch({ productId: "gone", name: "Old item" }, catalogIndex)).toEqual({
      highlightedOptionIds: [],
      imageUrl: undefined,
    });
  });
});

describe("getLeadContact", () => {
  it("skips the placeholders the leads list fills in", () => {
    expect(
      getLeadContact({ name: "+923001234567", phone: "+923001234567", city: "Unknown" }),
    ).toEqual({ customerName: "", customerPhone: "+923001234567", email: "", city: "" });
  });
});

describe("order form schema", () => {
  const validValues = {
    ...getNewOrderFormValues("lead-1", undefined),
    shipping: deliveryValues,
    items: [{ productId: "p2", name: "Silk Scarf", quantity: "2", unitPrice: "900" }],
  };

  it("requires an address on a new order", () => {
    const result = getOrderFormSchema(true).safeParse({
      ...validValues,
      shipping: { ...deliveryValues, addressLine1: "" },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toContain(
      "shipping.addressLine1",
    );
  });

  it("lets an order saved without an address stay without one", () => {
    const result = getOrderFormSchema(false).safeParse({
      ...validValues,
      shipping: { ...deliveryValues, addressLine1: "", city: "", customerName: "" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a discount larger than the subtotal", () => {
    const result = getOrderFormSchema(true).safeParse({ ...validValues, discount: "5000" });
    expect(result.error?.issues.map((issue) => issue.path.join("."))).toEqual(["discount"]);
  });

  it("builds the create payload without blank optional fields", () => {
    const parsed = getOrderFormSchema(true).parse(validValues);
    expect(toCreateOrderPayload(parsed)).toEqual({
      leadId: "lead-1",
      status: "PENDING",
      currency: "PKR",
      discount: 0,
      items: [{ productId: "p2", name: "Silk Scarf", quantity: 2, unitPrice: 900 }],
      shipping: {
        customerName: "Ayesha Khan",
        customerPhone: "+92 300 1234567",
        addressLine1: "House 12, Street 4",
        city: "Lahore",
        country: "PK",
      },
    });
  });
});

describe("editing a saved order", () => {
  const savedOrder = {
    id: "o1",
    leadId: "lead-1",
    conversationId: null,
    currency: "PKR",
    discount: "0",
    notes: null,
    customerName: "Ayesha",
    customerPhone: "+923001234567",
    shippingDetail: null,
    lead: null,
    items: [
      {
        id: "i1",
        productId: "p1",
        variantId: "v1",
        name: "Linen Shirt (Black / M)",
        sku: "LS-1-BLK",
        imageUrl: null,
        quantity: 1,
        unitPrice: "3000",
        subtotal: "3000",
        customOptions: [
          { key: "print", label: "Print", value: "Name", priceDelta: 300, requiresQuote: false },
        ],
        customizationTotal: 300,
      },
    ],
  } as unknown as Order;

  it("takes the customization surcharge out of the editable price", () => {
    const values = getSavedOrderFormValues(savedOrder);
    expect(values.items[0]).toMatchObject({ unitPrice: 2700, customizationTotal: 300 });
    expect(values.shipping).toMatchObject({ customerName: "Ayesha", addressLine1: "" });
  });

  it("sends the lines only when they changed", () => {
    const values = getSavedOrderFormValues(savedOrder);
    expect(haveOrderLinesChanged(values.items, values.items)).toBe(false);

    const editedLines = [{ ...values.items[0]!, quantity: 2 }];
    expect(haveOrderLinesChanged(values.items, editedLines)).toBe(true);
    expect(toUpdateOrderPayload(values, false)).toEqual({
      currency: "PKR",
      discount: 0,
      notes: "",
    });
    expect(toUpdateOrderPayload({ ...values, items: editedLines }, true).items).toEqual([
      {
        productId: "p1",
        variantId: "v1",
        name: "Linen Shirt (Black / M)",
        sku: "LS-1-BLK",
        quantity: 2,
        unitPrice: 2700,
        customOptions: savedOrder.items[0]!.customOptions,
      },
    ]);
  });
});
