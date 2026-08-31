import { describe, expect, it } from "vitest";
import {
  createWorkspaceSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./index";

const validRegistration = {
  firstName: "Ali",
  email: "ali@example.com",
  password: "Sup3rSecret",
  acceptTerms: true,
};

describe("loginSchema", () => {
  it("accepts a valid login payload", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rejects a malformed email and an empty password", () => {
    expect(loginSchema.safeParse({ email: "not-an-email", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts a valid registration", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it.each([
    ["short", "Short1"],
    ["no uppercase", "alllowercase1"],
    ["no number", "NoNumberHere"],
  ])("rejects a password with %s", (_label, password) => {
    expect(registerSchema.safeParse({ ...validRegistration, password }).success).toBe(false);
  });

  it("requires accepted terms", () => {
    const result = registerSchema.safeParse({ ...validRegistration, acceptTerms: false });
    expect(result.success).toBe(false);
  });

  it("requires a first name but not a last name", () => {
    expect(registerSchema.safeParse({ ...validRegistration, firstName: "" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validRegistration, lastName: undefined }).success).toBe(true);
  });
});

describe("createWorkspaceSchema", () => {
  it("requires at least 2 characters for both names", () => {
    expect(createWorkspaceSchema.safeParse({ name: "A", businessName: "My Shop" }).success).toBe(false);
    expect(createWorkspaceSchema.safeParse({ name: "My Shop", businessName: "A" }).success).toBe(false);
    expect(createWorkspaceSchema.safeParse({ name: "My Shop", businessName: "My Shop" }).success).toBe(true);
  });

  it("requires a business name alongside the workspace name", () => {
    expect(createWorkspaceSchema.safeParse({ name: "My Shop" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("rejects mismatched passwords on the confirm field", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Sup3rSecret",
      confirmPassword: "Different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });

  it("accepts matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      password: "Sup3rSecret",
      confirmPassword: "Sup3rSecret",
    });
    expect(result.success).toBe(true);
  });
});
