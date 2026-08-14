import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatActivityDate, formatDate, formatDateTime } from "./date";

describe("date formatting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 11, 15, 0, 0)); // 11 Aug 2026, local time
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDate", () => {
    it("renders an unambiguous day-month-year", () => {
      expect(formatDate(new Date(2026, 7, 7))).toBe("7 Aug 2026");
    });

    it("falls back on empty and invalid input", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate("")).toBe("—");
      expect(formatDate("not-a-date", "n/a")).toBe("n/a");
    });
  });

  describe("formatDateTime", () => {
    it("appends the local time", () => {
      expect(formatDateTime(new Date(2026, 7, 7, 15, 42))).toBe("7 Aug 2026, 3:42 pm");
    });
  });

  describe("formatActivityDate", () => {
    it("labels today and yesterday", () => {
      expect(formatActivityDate(new Date(2026, 7, 11, 1, 0))).toBe("Today");
      expect(formatActivityDate(new Date(2026, 7, 10, 23, 59))).toBe("Yesterday");
    });

    it("counts recent days and dates anything a week or older", () => {
      expect(formatActivityDate(new Date(2026, 7, 8))).toBe("3 days ago");
      expect(formatActivityDate(new Date(2026, 7, 4))).toBe("4 Aug 2026");
    });

    it("defaults to Never for missing values", () => {
      expect(formatActivityDate(null)).toBe("Never");
      expect(formatActivityDate(undefined, "No activity")).toBe("No activity");
    });
  });
});
