import { describe, expect, it } from "vitest";
import {
  deriveUniqueFieldName,
  fallbackFieldName,
  MAX_FIELD_NAME_LENGTH,
  toFieldName,
} from "./fieldName";

describe("toFieldName", () => {
  it("camelCases question text", () => {
    expect(toFieldName("What's your monthly budget?")).toBe("whatSYourMonthlyBudget");
    expect(toFieldName("City")).toBe("city");
  });

  it("prefixes var_ when the first word starts with a digit", () => {
    expect(toFieldName("2026 revenue?")).toBe("var_2026Revenue");
  });

  it("returns an empty string for text with no ASCII characters", () => {
    expect(toFieldName("آپ کا بجٹ؟")).toBe("");
    expect(toFieldName("???")).toBe("");
  });

  it("stops at the last whole word that fits the cap", () => {
    const result = toFieldName("what is your approximate expected yearly marketing budget range");
    expect(result.length).toBeLessThanOrEqual(MAX_FIELD_NAME_LENGTH);
    expect(result).toMatch(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
  });

  it("hard-truncates a single word longer than the cap", () => {
    const result = toFieldName("a".repeat(60));
    expect(result).toBe("a".repeat(MAX_FIELD_NAME_LENGTH));
  });
});

describe("fallbackFieldName", () => {
  it("is 1-based", () => {
    expect(fallbackFieldName(0)).toBe("question1");
    expect(fallbackFieldName(4)).toBe("question5");
  });
});

describe("deriveUniqueFieldName", () => {
  it("returns the derived key when free", () => {
    expect(deriveUniqueFieldName("Budget?", 0, [])).toBe("budget");
  });

  it("falls back to the positional key for underivable text", () => {
    expect(deriveUniqueFieldName("؟؟؟", 2, [])).toBe("question3");
  });

  it("numbers collisions starting at 2", () => {
    expect(deriveUniqueFieldName("Budget?", 0, ["budget"])).toBe("budget2");
    expect(deriveUniqueFieldName("Budget?", 0, ["budget", "budget2"])).toBe("budget3");
  });

  it("trims the base so a numbered key still fits the cap", () => {
    const longBase = toFieldName("a".repeat(60));
    const result = deriveUniqueFieldName("a".repeat(60), 0, [longBase]);
    expect(result.length).toBeLessThanOrEqual(MAX_FIELD_NAME_LENGTH);
    expect(result.endsWith("2")).toBe(true);
  });
});
