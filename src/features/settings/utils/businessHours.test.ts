import { describe, expect, it } from "vitest";
import { businessHoursFormSchema, type BusinessHoursPayload } from "../types";
import {
  DEFAULT_BUSINESS_HOURS_FORM,
  toBusinessHoursForm,
  toBusinessHoursPayload,
} from "./businessHours";

const OFFICE_HOURS: BusinessHoursPayload = {
  MON: { open: "09:00", close: "18:00" },
  TUE: { open: "09:00", close: "18:00" },
  WED: { open: "09:00", close: "13:00" },
  THU: { open: "10:00", close: "20:00" },
  FRI: { open: "09:00", close: "18:00" },
  SAT: null,
  SUN: null,
};

describe("business hours form mapping", () => {
  it("reads nothing saved as open all the time", () => {
    expect(toBusinessHoursForm(null).isOpenAllTime).toBe(true);
    expect(toBusinessHoursForm(undefined).isOpenAllTime).toBe(true);
  });

  it("reads a saved record with no open day as open all the time", () => {
    const everyDayClosed = { ...OFFICE_HOURS, MON: null, TUE: null, WED: null, THU: null, FRI: null };
    expect(toBusinessHoursForm(everyDayClosed).isOpenAllTime).toBe(true);
  });

  it("round-trips a different window per day and closed days", () => {
    const form = toBusinessHoursForm(OFFICE_HOURS);

    expect(form.isOpenAllTime).toBe(false);
    expect(form.days.WED).toEqual({ isOpen: true, open: "09:00", close: "13:00" });
    expect(form.days.THU).toEqual({ isOpen: true, open: "10:00", close: "20:00" });
    expect(form.days.SAT.isOpen).toBe(false);
    expect(toBusinessHoursPayload(form)).toEqual({ businessHours: OFFICE_HOURS });
  });

  it("sends null for open all the time", () => {
    expect(toBusinessHoursPayload(DEFAULT_BUSINESS_HOURS_FORM)).toEqual({ businessHours: null });
  });
});

describe("businessHoursFormSchema", () => {
  const customHours = toBusinessHoursForm(OFFICE_HOURS);

  it("accepts open all the time and valid custom hours", () => {
    expect(businessHoursFormSchema.safeParse(DEFAULT_BUSINESS_HOURS_FORM).success).toBe(true);
    expect(businessHoursFormSchema.safeParse(customHours).success).toBe(true);
  });

  it("accepts overnight business hours spanning from PM to AM next day", () => {
    const result = businessHoursFormSchema.safeParse({
      ...customHours,
      days: { ...customHours.days, TUE: { isOpen: true, open: "18:00", close: "03:00" } },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a closing time identical to opening, on that day only", () => {
    const result = businessHoursFormSchema.safeParse({
      ...customHours,
      days: { ...customHours.days, TUE: { isOpen: true, open: "09:00", close: "09:00" } },
    });
    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues.map((issue) => issue.path.join("."))).toEqual(["days.TUE.close"]);
  });

  it("ignores the times of a closed day", () => {
    const result = businessHoursFormSchema.safeParse({
      ...customHours,
      days: { ...customHours.days, SAT: { isOpen: false, open: "18:00", close: "09:00" } },
    });
    expect(result.success).toBe(true);
  });

  it("rejects custom hours with every day closed", () => {
    const allClosed = Object.fromEntries(
      Object.entries(customHours.days).map(([weekday, day]) => [weekday, { ...day, isOpen: false }]),
    );
    expect(businessHoursFormSchema.safeParse({ ...customHours, days: allClosed }).success).toBe(false);
  });
});
