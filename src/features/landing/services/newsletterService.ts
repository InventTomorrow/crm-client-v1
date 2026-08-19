import { apiClient } from "@/lib/apiClient";
import type {
  NewsletterSubscribeInput,
  NewsletterSubscribeResponse,
} from "../types";

export async function subscribeToNewsletter(input: NewsletterSubscribeInput) {
  const res = await apiClient.post<{
    success: true;
    data: NewsletterSubscribeResponse;
  }>("/public/newsletter/subscribe", { ...input, source: "landing-footer" });
  return res.data.data;
}
