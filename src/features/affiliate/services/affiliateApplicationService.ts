import { apiClient } from "@/lib/apiClient";
import type { AffiliateApplicationInput } from "../types";

export async function submitAffiliateApplication(input: AffiliateApplicationInput): Promise<{ message: string }> {
  const res = await apiClient.post<{ success: true; data: { message: string } }>("/public/affiliate-applications", {
    name: input.name,
    email: input.email,
    message: input.message,
    // The server rejects empty strings for these rather than treating them as absent.
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.website ? { website: input.website } : {}),
  });
  return res.data.data;
}
