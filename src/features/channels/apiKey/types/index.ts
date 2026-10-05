import { z } from "zod";
import { isValidJson } from "../utils/json";

export type ApiKeyMode = "LIVE" | "SANDBOX";

export interface ApiKey {
  id: string;
  name: string;
  mode: ApiKeyMode;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

/** Only returned once, from the create response — never persisted client-side. */
export interface CreatedApiKey extends ApiKey {
  key: string;
}

export interface CreateApiKeyDto {
  name: string;
  mode: ApiKeyMode;
}

/** Raw HTTP outcome of a sandbox call — error statuses are shown to the developer, not thrown. */
export interface SandboxHttpResponse {
  httpStatus: number;
  body: unknown;
}

const LIVE_KEY_PREFIX = "sk_live_";
const API_KEY_PREFIXES = ["sk_test_", LIVE_KEY_PREFIX];

export const isLiveApiKey = (apiKey: string): boolean =>
  apiKey.trim().startsWith(LIVE_KEY_PREFIX);

// Live keys are allowed so the full workflow can be tested from the CRM; the form warns before they're used.
const sandboxApiKeySchema = z
  .string()
  .trim()
  .min(1, "Paste an API key")
  .refine(
    (apiKey) => API_KEY_PREFIXES.some((prefix) => apiKey.startsWith(prefix)),
    "API keys start with sk_test_ or sk_live_",
  );

export const orderSandboxFormSchema = z.object({
  apiKey: sandboxApiKeySchema,
  payloadText: z.string().refine(isValidJson, "Payload must be valid JSON"),
});
export type OrderSandboxFormValues = z.infer<typeof orderSandboxFormSchema>;
