import { apiClient } from "@/lib/apiClient";
import { SERVER_FETCH_TIMEOUT_MS } from "@/lib/utils";
import {
  leadPricingSchema,
  type CustomPlanRequestFormValues,
  type CustomPlanRequestResponse,
  type LeadPricing,
} from "../types";

/** Server-component read for the landing page, so the calculator ships in the SSR HTML. */
export async function fetchLeadPricing(): Promise<LeadPricing | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const response = await fetch(
      `${apiUrl.replace(/\/$/, "")}/api/v1/public/plans/lead-pricing`,
      {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(SERVER_FETCH_TIMEOUT_MS),
      },
    );
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: unknown };
    const parsed = leadPricingSchema.safeParse(payload.data);
    return parsed.success ? parsed.data : null;
  } catch {
    // Never let a pricing fetch take the whole marketing page down.
    return null;
  }
}

/** In-app read through the shared axios client. */
export async function getLeadPricing(): Promise<LeadPricing> {
  const response = await apiClient.get<{ success: true; data: unknown }>(
    "/public/plans/lead-pricing",
  );
  return leadPricingSchema.parse(response.data.data);
}

export async function submitCustomPlanRequest(
  values: CustomPlanRequestFormValues,
): Promise<CustomPlanRequestResponse> {
  const response = await apiClient.post<{
    success: true;
    data: CustomPlanRequestResponse;
  }>("/public/plans/custom-requests", {
    ...values,
    // Optional on the server; send nothing rather than an empty string.
    businessName: values.businessName || undefined,
    customerNote: values.customerNote || undefined,
  });
  return response.data.data;
}
