import { describe, expect, it } from "vitest";
import { isValidEscalationPhone } from "./escalationPhone";

describe("isValidEscalationPhone", () => {
  it.each([
    "",
    "03001234567",
    "0300 1234567",
    "0300-123-4567",
    "3001234567",
    "923001234567",
    "0092 300 1234567",
    "+92 300 1234567",
    "+447911123456",
  ])("accepts %j", (phone) => {
    expect(isValidEscalationPhone(phone)).toBe(true);
  });

  it.each(["0300123", "abc", "+12", "0200 1234567", "030012345678"])(
    "rejects %j",
    (phone) => {
      expect(isValidEscalationPhone(phone)).toBe(false);
    },
  );
});
