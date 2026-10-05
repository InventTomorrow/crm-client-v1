"use client";
import { Button } from "@/shared/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Loader2, RotateCcw, Send } from "lucide-react";
import { useOrderSandboxForm } from "../../hooks/useOrderSandboxForm";
import { CREATE_ORDER_URL } from "../../utils/apiDocs.content";
import { CopyableCode } from "../CopyableCode";
import { PayloadEditor } from "../PayloadEditor";
import { SandboxKeyInput, SandboxKeysHint } from "./SandboxKeyInput";
import { SandboxResult } from "./SandboxResult";

export function OrderSandboxView() {
  const {
    form,
    submitTestOrder,
    resetPayloadToSample,
    sandboxResponse,
    requestError,
    isSending,
  } = useOrderSandboxForm();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className="card flex flex-col gap-5 p-5 md:p-6">
        <div>
          <h2 className="text-lg font-semibold">Orders sandbox</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-mute)]">
            Send a test order. A Sandbox key saves it as a sandbox order; a
            Live key runs the full workflow and creates a real order.
          </p>
        </div>

        <CopyableCode inline code={`POST ${CREATE_ORDER_URL}`} />

        <Form {...form}>
          <form onSubmit={submitTestOrder} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">API key</FormLabel>
                  <FormControl>
                    <SandboxKeyInput
                      {...field}
                      liveKeyWarning="This creates a real order and sends the customer a WhatsApp receipt."
                    />
                  </FormControl>
                  <FormDescription className="text-xs leading-5">
                    <SandboxKeysHint />
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payloadText"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-sm">Request body</FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetPayloadToSample}
                    >
                      <RotateCcw size={13} /> Reset sample
                    </Button>
                  </div>
                  <FormControl>
                    <PayloadEditor {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSending} className="self-start">
              {isSending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
              Send test order
            </Button>
          </form>
        </Form>
      </section>

      <SandboxResult
        sandboxResponse={sandboxResponse}
        requestError={requestError}
      />
    </div>
  );
}
