import { apiClient } from "@/lib/apiClient";
import type { ContactMessageInput, ContactMessageResponse } from "../types";

export async function sendContactMessage(input: ContactMessageInput) {
  const res = await apiClient.post<{
    success: true;
    data: ContactMessageResponse;
  }>("/public/contact", {
    ...input,
    // The server rejects an empty phone rather than treating it as absent.
    phone: input.phone.trim() === "" ? undefined : input.phone,
    source: "help-center",
  });
  return res.data.data;
}
