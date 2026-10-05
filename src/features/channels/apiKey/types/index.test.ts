import { describe, expect, it } from "vitest";
import { isLiveApiKey, orderSandboxFormSchema } from "./index";

const SANDBOX_KEY = "sk_test_example";
const VALID_PAYLOAD_TEXT = '{"externalOrderId":"sandbox-1"}';

describe("orderSandboxFormSchema", () => {
  it("accepts a Sandbox key with a JSON payload", () => {
    const result = orderSandboxFormSchema.safeParse({
      apiKey: SANDBOX_KEY,
      payloadText: VALID_PAYLOAD_TEXT,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a Live key so the full workflow can be tested", () => {
    const result = orderSandboxFormSchema.safeParse({
      apiKey: "sk_live_example",
      payloadText: VALID_PAYLOAD_TEXT,
    });

    expect(result.success).toBe(true);
  });

  it.each(["pk_test_abc", "random-text", "  "])("rejects the API key %j", (apiKey) => {
    const result = orderSandboxFormSchema.safeParse({ apiKey, payloadText: VALID_PAYLOAD_TEXT });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["apiKey"]);
  });

  it("rejects a payload that isn't valid JSON", () => {
    const result = orderSandboxFormSchema.safeParse({
      apiKey: SANDBOX_KEY,
      payloadText: "{ externalOrderId: sandbox-1 ",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["payloadText"]);
  });
});

describe("isLiveApiKey", () => {
  it("flags only Live keys as live", () => {
    expect(isLiveApiKey(" sk_live_abc")).toBe(true);
    expect(isLiveApiKey(SANDBOX_KEY)).toBe(false);
  });
});
