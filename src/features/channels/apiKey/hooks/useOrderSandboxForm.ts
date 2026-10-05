"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { orderSandboxFormSchema, type OrderSandboxFormValues } from "../types";
import { buildSampleOrderPayloadText } from "../utils/sandboxSamples";
import { useSendTestExternalOrder } from "./useApiKeys";

export function useOrderSandboxForm() {
  const form = useForm<OrderSandboxFormValues>({
    resolver: zodResolver(orderSandboxFormSchema),
    defaultValues: { apiKey: "", payloadText: buildSampleOrderPayloadText() },
  });
  const sendTestOrder = useSendTestExternalOrder();

  const submitTestOrder = form.handleSubmit((values) =>
    sendTestOrder.mutate({
      apiKey: values.apiKey,
      payload: JSON.parse(values.payloadText),
    }),
  );

  const resetPayloadToSample = () =>
    form.setValue("payloadText", buildSampleOrderPayloadText(), {
      shouldValidate: true,
    });

  return {
    form,
    submitTestOrder,
    resetPayloadToSample,
    sandboxResponse: sendTestOrder.data,
    requestError: sendTestOrder.error,
    isSending: sendTestOrder.isPending,
  };
}
