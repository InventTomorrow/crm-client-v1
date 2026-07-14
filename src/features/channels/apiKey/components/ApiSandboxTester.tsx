"use client";
import { extractErrorMessage } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { AlertTriangle, KeyRound, Loader2, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useApiKeysQuery, useSendTestExternalOrder } from "../hooks/useApiKeys";
import type { ApiKey } from "../types";
import { CopyableCode } from "./CopyableCode";
import { PayloadEditor } from "./PayloadEditor";

const EXAMPLE_PAYLOAD = {
  externalOrderId: `test-${Date.now()}`,
  currency: "PKR",
  notes: "Sandbox test order",
  customer: {
    name: "Test Customer",
    phone: "+923120012250",
    email: "abwaheed.ahmad@gmail.com",
  },
  items: [{ name: "Sample Item", quantity: 1, unitPrice: 9.99 }],
  shipping: {
    addressLine1: "123 Test Street",
    city: "Islamabad",
    country: "Pakistan",
  },
};

export function ApiSandboxTester() {
  const { data: apiKeys = [] } = useApiKeysQuery();
  const sandboxKeys = useMemo(
    () =>
      apiKeys.filter(
        (apiKey: ApiKey) => apiKey.mode === "SANDBOX" && !apiKey.revokedAt,
      ),
    [apiKeys],
  );
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(EXAMPLE_PAYLOAD, null, 2),
  );
  const [responseText, setResponseText] = useState<string | null>(null);
  const [responseError, setResponseError] = useState<string | null>(null);
  const { mutate: sendTest, isPending } = useSendTestExternalOrder();

  // Sandbox keys never expose their plaintext again after creation, so the
  // tester runs against whatever key the user pastes here (the value they
  // saved when they created it), rather than something we could look up.
  const [manualKey, setManualKey] = useState("");

  const handleSend = () => {
    setResponseText(null);
    setResponseError(null);
    let payload: unknown;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setResponseError("Payload is not valid JSON.");
      return;
    }
    if (!manualKey) {
      setResponseError("Paste a Sandbox key's plaintext value above to test.");
      return;
    }
    sendTest(
      { key: manualKey, payload },
      {
        onSuccess: (data) => setResponseText(JSON.stringify(data, null, 2)),
        onError: (error) =>
          setResponseError(extractErrorMessage(error, "Request failed")),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[12.5px] text-[var(--ink-mute)]">
          Paste one of your Sandbox key&apos;s plaintext values (shown once when
          you create it) to send a real test request to the external-orders
          endpoint, right from here — no code required.
        </p>
        {sandboxKeys.length > 0 && (
          <p className="mt-1 text-[12px] text-[var(--ink-mute)]">
            Your sandbox keys:{" "}
            {sandboxKeys
              .map((k: ApiKey) => `${k.name} (${k.keyPrefix}…)`)
              .join(", ")}
          </p>
        )}
      </div>

      <div className="relative">
        <KeyRound
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]"
        />
        <Input
          value={manualKey}
          onChange={(e) => setManualKey(e.target.value)}
          placeholder="sk_test_..."
          className="pl-8 font-mono text-[12.5px]"
        />
      </div>

      <PayloadEditor value={payloadText} onChange={setPayloadText} />

      <Button
        type="button"
        onClick={handleSend}
        disabled={isPending}
        className="self-start"
      >
        {isPending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Send size={13} />
        )}
        Send test request
      </Button>

      {responseError && (
        <div className="flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-[12.5px] text-[#991B1B]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {responseError}
        </div>
      )}
      {responseText && <CopyableCode language="json" code={responseText} />}
    </div>
  );
}
