import { describe, expect, it } from "vitest";
import { leadFormSchema } from "./validations.lead";

const validLead = {
  name: "Ali Raza",
  phone: "+92 300 1234567",
  email: "ali@example.com",
  city: "Lahore",
  channel: "wa",
  status: "prospect",
};

describe("leadFormSchema", () => {
  it("accepts a complete lead", () => {
    expect(leadFormSchema.safeParse(validLead).success).toBe(true);
  });

  it("requires a name of at least 2 characters", () => {
    expect(leadFormSchema.safeParse({ ...validLead, name: "A" }).success).toBe(false);
  });

  it("allows an empty phone but rejects a malformed one", () => {
    expect(leadFormSchema.safeParse({ ...validLead, phone: undefined }).success).toBe(true);
    expect(leadFormSchema.safeParse({ ...validLead, phone: "12" }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...validLead, phone: "abc-def-ghij" }).success).toBe(false);
  });

  it("lowercases the email and allows an empty string", () => {
    const parsed = leadFormSchema.parse({ ...validLead, email: "ALI@Example.COM" });
    expect(parsed.email).toBe("ali@example.com");
    expect(leadFormSchema.safeParse({ ...validLead, email: "" }).success).toBe(true);
    expect(leadFormSchema.safeParse({ ...validLead, email: "nope" }).success).toBe(false);
  });

  it("rejects unknown status and channel values", () => {
    expect(leadFormSchema.safeParse({ ...validLead, status: "lukewarm" }).success).toBe(false);
    expect(leadFormSchema.safeParse({ ...validLead, channel: "ig" }).success).toBe(false);
  });
});
