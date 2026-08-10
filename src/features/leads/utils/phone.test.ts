import { describe, expect, it } from "vitest";
import { localPhoneDigits } from "./phone";

describe("localPhoneDigits", () => {
  it("resolves local and international forms to the same identity", () => {
    expect(localPhoneDigits("+92 300 1234567")).toBe(localPhoneDigits("03001234567"));
  });

  it("strips every non-digit character", () => {
    expect(localPhoneDigits("(0300) 123-4567")).toBe("3001234567");
  });

  it("keeps only the last 10 digits", () => {
    expect(localPhoneDigits("0092 300 1234567")).toBe("3001234567");
  });

  it("returns an empty string when there are no digits", () => {
    expect(localPhoneDigits("")).toBe("");
    expect(localPhoneDigits("no digits here")).toBe("");
  });
});
