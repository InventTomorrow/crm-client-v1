import { describe, expect, it } from "vitest";
import { bookingConfigFormSchema, bookingWindowSchema, minutesBetween } from "./index";

const validConfig = {
  label: "Strategy Call",
  meetingType: "PHONE",
  durationMinutes: 30,
  bufferMinutes: 0,
  maxPerDay: 8,
  minAdvanceHours: 2,
  maxAdvanceDays: 30,
  timezone: "Asia/Karachi",
  availableDays: ["MON", "TUE"],
  workingHours: [{ startTime: "09:00", endTime: "17:00" }],
  confirmationMessage: "",
  reminderMessage: "",
  reminderLeadMinutes: 60,
  assignedStaffIds: [],
  isActive: true,
};

describe("minutesBetween", () => {
  it("computes the span of a window in minutes", () => {
    expect(minutesBetween("09:00", "17:00")).toBe(480);
    expect(minutesBetween("09:15", "09:45")).toBe(30);
  });

  it("goes negative for a backwards window", () => {
    expect(minutesBetween("17:00", "09:00")).toBe(-480);
  });
});

describe("bookingWindowSchema", () => {
  it("requires 24-hour HH:mm and end after start", () => {
    expect(bookingWindowSchema.safeParse({ startTime: "09:00", endTime: "10:00" }).success).toBe(true);
    expect(bookingWindowSchema.safeParse({ startTime: "9am", endTime: "10:00" }).success).toBe(false);
    expect(bookingWindowSchema.safeParse({ startTime: "25:00", endTime: "26:00" }).success).toBe(false);

    const backwards = bookingWindowSchema.safeParse({ startTime: "10:00", endTime: "09:00" });
    expect(backwards.success).toBe(false);
    if (!backwards.success) {
      expect(backwards.error.issues[0]?.path).toEqual(["endTime"]);
    }
  });
});

describe("bookingConfigFormSchema", () => {
  it("accepts a complete config", () => {
    expect(bookingConfigFormSchema.safeParse(validConfig).success).toBe(true);
  });

  it("rejects a config where no window fits one meeting", () => {
    const result = bookingConfigFormSchema.safeParse({
      ...validConfig,
      durationMinutes: 60,
      workingHours: [{ startTime: "09:00", endTime: "09:30" }],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one day and one window", () => {
    expect(bookingConfigFormSchema.safeParse({ ...validConfig, availableDays: [] }).success).toBe(false);
    expect(bookingConfigFormSchema.safeParse({ ...validConfig, workingHours: [] }).success).toBe(false);
  });
});
