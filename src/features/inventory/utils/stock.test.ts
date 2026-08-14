import { describe, expect, it } from "vitest";
import { STOCK_LABEL, stockStatus } from "./stock";

describe("stockStatus", () => {
  it("maps the boundaries: 0 → out, 1–12 → low, 13+ → in", () => {
    expect(stockStatus(0)).toBe("out");
    expect(stockStatus(1)).toBe("low");
    expect(stockStatus(12)).toBe("low");
    expect(stockStatus(13)).toBe("in");
  });

  it("has a label for every status", () => {
    expect(STOCK_LABEL[stockStatus(0)]).toBe("Out of stock");
    expect(STOCK_LABEL[stockStatus(5)]).toBe("Low stock");
    expect(STOCK_LABEL[stockStatus(100)]).toBe("In stock");
  });
});
