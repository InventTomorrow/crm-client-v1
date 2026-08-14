import { describe, expect, it } from "vitest";
import type { OrderStatus } from "../types";
import { formatMoney, ORDER_PLATFORM_META, ORDER_STATUS_META } from "./format";

describe("formatMoney", () => {
  it("formats known currencies with their symbol", () => {
    expect(formatMoney(1500, "USD")).toBe("$1,500.00");
    expect(formatMoney("2500", "PKR")).toContain("2,500");
  });

  it("treats non-finite input as zero", () => {
    expect(formatMoney(Number.NaN, "USD")).toBe("$0.00");
    expect(formatMoney("not-a-number", "USD")).toBe("$0.00");
  });

  it("falls back to a plain prefix for an invalid currency code", () => {
    expect(formatMoney(10, "??")).toBe("?? 10.00");
  });
});

describe("order meta maps", () => {
  it("covers every order status with a label", () => {
    const statuses: OrderStatus[] = [
      "DRAFT", "PENDING", "CONFIRMED", "PAID", "PROCESSING", "SHIPPED",
      "OUT_FOR_DELIVERY", "DELIVERED", "FULFILLED", "COMPLETED", "CANCELLED", "REFUNDED",
    ];
    for (const status of statuses) {
      expect(ORDER_STATUS_META[status]?.label).toBeTruthy();
    }
  });

  it("labels every platform", () => {
    expect(ORDER_PLATFORM_META.API.label).toBe("Website");
    expect(ORDER_PLATFORM_META.INTERNAL.label).toBe("Internal");
    expect(ORDER_PLATFORM_META.SHOPIFY.label).toBe("Shopify");
  });
});
