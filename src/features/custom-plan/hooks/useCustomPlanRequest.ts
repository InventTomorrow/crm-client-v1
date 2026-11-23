"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { submitCustomPlanRequest } from "../services/customPlanService";
import {
  customPlanRequestSchema,
  type CustomPlanRequestFormValues,
  type LeadPricing,
} from "../types";
import { getLeadPlanQuote } from "../utils/leadPricing";

const DEFAULT_MONTHLY_LEADS = 200;

/** Calculator + request form, shared by the landing section and the in-app dialog. */
export function useCustomPlanRequest(
  leadPricing: LeadPricing,
  prefill: Partial<CustomPlanRequestFormValues> = {},
) {
  const form = useForm<CustomPlanRequestFormValues>({
    resolver: zodResolver(customPlanRequestSchema),
    defaultValues: {
      monthlyLeads: DEFAULT_MONTHLY_LEADS,
      duration: "MONTHLY",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      businessName: "",
      customerNote: "",
      ...prefill,
    },
  });

  const [monthlyLeads, duration] = useWatch({
    control: form.control,
    name: ["monthlyLeads", "duration"],
  });
  const hasValidLeadCount =
    Number.isInteger(monthlyLeads) &&
    monthlyLeads >= leadPricing.minLeads &&
    monthlyLeads <= leadPricing.maxLeads;
  const quote = hasValidLeadCount
    ? getLeadPlanQuote(monthlyLeads, duration, leadPricing)
    : null;

  const mutation = useMutation({
    mutationFn: submitCustomPlanRequest,
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  const startNewRequest = () => {
    mutation.reset();
    form.reset();
  };

  return {
    form,
    quote,
    onSubmit,
    isSubmitting: mutation.isPending,
    submittedRequest: mutation.data ?? null,
    submittedEmail: mutation.variables?.customerEmail ?? null,
    startNewRequest,
  };
}
