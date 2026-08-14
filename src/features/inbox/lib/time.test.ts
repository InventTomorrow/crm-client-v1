import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dayLabel, groupByDay, relativeTime } from "./time";

describe("inbox time helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 11, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("relativeTime", () => {
    it("steps through just now → minutes → hours → days", () => {
      const now = Date.now();
      expect(relativeTime(new Date(now - 30_000).toISOString())).toBe("just now");
      expect(relativeTime(new Date(now - 5 * 60_000).toISOString())).toBe("5m");
      expect(relativeTime(new Date(now - 3 * 3600_000).toISOString())).toBe("3h");
      expect(relativeTime(new Date(now - 49 * 3600_000).toISOString())).toBe("2d");
    });
  });

  describe("groupByDay", () => {
    it("groups consecutive same-day items and splits on day change", () => {
      const items = [
        { id: 1, createdAt: new Date(2026, 7, 10, 9, 0).toISOString() },
        { id: 2, createdAt: new Date(2026, 7, 10, 10, 0).toISOString() },
        { id: 3, createdAt: new Date(2026, 7, 11, 8, 0).toISOString() },
      ];
      const groups = groupByDay(items);
      expect(groups).toHaveLength(2);
      expect(groups[0]?.items.map((i) => i.id)).toEqual([1, 2]);
      expect(groups[1]?.items.map((i) => i.id)).toEqual([3]);
    });

    it("returns an empty list for no items", () => {
      expect(groupByDay([])).toEqual([]);
    });
  });

  describe("dayLabel", () => {
    it("labels today and yesterday", () => {
      expect(dayLabel(new Date(2026, 7, 11, 1, 0).toISOString())).toBe("Today");
      expect(dayLabel(new Date(2026, 7, 10, 23, 0).toISOString())).toBe("Yesterday");
    });

    it("shows the year only when it differs from the current year", () => {
      expect(dayLabel(new Date(2026, 0, 5).toISOString())).not.toContain("2026");
      expect(dayLabel(new Date(2025, 0, 5).toISOString())).toContain("2025");
    });
  });
});
