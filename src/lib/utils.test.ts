import { describe, expect, it } from "vitest";
import {
  cn,
  extractApiErrorCode,
  extractErrorMessage,
  getImageUrl,
  gradientFor,
  initials,
  pkr,
} from "./utils";

/** Minimal axios-like error shape the extractors are written against. */
const axiosError = (overrides: Record<string, unknown> = {}) => ({
  message: "Request failed with status code 400",
  ...overrides,
});

describe("cn", () => {
  it("merges conflicting Tailwind classes, last one winning", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("pkr", () => {
  it("formats an amount with the Rs. prefix and grouping", () => {
    expect(pkr(1500)).toBe("Rs. 1,500");
    expect(pkr(0)).toBe("Rs. 0");
  });
});

describe("initials", () => {
  it("takes the first letter of the first two words, uppercased", () => {
    expect(initials("ali raza")).toBe("AR");
    expect(initials("Sara")).toBe("S");
    expect(initials("One Two Three")).toBe("OT");
  });
});

describe("gradientFor", () => {
  it("is deterministic for the same name", () => {
    expect(gradientFor("Ali")).toBe(gradientFor("Ali"));
  });

  it("returns a CSS linear-gradient", () => {
    expect(gradientFor("Anything")).toMatch(/^linear-gradient\(135deg, #/);
  });
});

describe("extractErrorMessage", () => {
  it("prefers the backend's structured message", () => {
    const error = axiosError({
      response: { status: 400, data: { error: { message: "Phone already exists" } } },
    });
    expect(extractErrorMessage(error)).toBe("Phone already exists");
  });

  it("prefers the first field-level detail over the top-level message", () => {
    const error = axiosError({
      response: {
        status: 400,
        data: {
          error: {
            message: "Validation failed: name — required",
            details: [{ message: "Workspace name is required" }, { message: "Email is invalid" }],
          },
        },
      },
    });
    expect(extractErrorMessage(error)).toBe("Workspace name is required (and 1 more issue)");
  });

  it("maps a bare HTTP status to friendly copy", () => {
    const error = axiosError({ response: { status: 401, data: {} } });
    expect(extractErrorMessage(error)).toBe("Your email or password is incorrect.");
  });

  it("maps an unknown 5xx status to the generic server copy", () => {
    const error = axiosError({ response: { status: 599, data: {} } });
    expect(extractErrorMessage(error)).toBe("Something went wrong on our end. Please try again.");
  });

  it("returns connection copy when the request never reached the server", () => {
    const error = axiosError({ code: "ERR_NETWORK", message: "Network Error" });
    expect(extractErrorMessage(error)).toBe(
      "Unable to connect. Check your internet connection and try again.",
    );
  });

  it("never surfaces raw axios status strings", () => {
    const error = axiosError({ response: undefined });
    expect(extractErrorMessage(error, "Fallback copy")).toBe("Fallback copy");
  });

  it("falls back for null/undefined errors", () => {
    expect(extractErrorMessage(null)).toBe("Something went wrong. Please try again.");
    expect(extractErrorMessage(undefined, "Custom")).toBe("Custom");
  });
});

describe("extractApiErrorCode", () => {
  it("returns the machine-readable code", () => {
    const error = axiosError({
      response: { data: { error: { code: "billing/plan_limit_reached", message: "Limit" } } },
    });
    expect(extractApiErrorCode(error)).toBe("billing/plan_limit_reached");
  });

  it("returns null when there is no structured code", () => {
    expect(extractApiErrorCode(axiosError())).toBeNull();
    expect(extractApiErrorCode(null)).toBeNull();
    expect(extractApiErrorCode(new Error("boom"))).toBeNull();
  });
});

describe("getImageUrl", () => {
  it("returns undefined for empty input", () => {
    expect(getImageUrl(null)).toBeUndefined();
    expect(getImageUrl(undefined)).toBeUndefined();
    expect(getImageUrl("")).toBeUndefined();
  });

  it("passes non-S3 URLs through untouched", () => {
    expect(getImageUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });

  it("proxies S3 URLs through the API image endpoint", () => {
    const s3Url = "https://bucket.s3.amazonaws.com/photo.jpg";
    const result = getImageUrl(s3Url);
    expect(result).toContain("/api/v1/upload/image?url=");
    expect(result).toContain(encodeURIComponent(s3Url));
  });
});
