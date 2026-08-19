import { z } from "zod";

/** Mirrors `subscribeNewsletterSchema` on the server. */
export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email")
    .max(160, "Email is too long"),
});

export type NewsletterSubscribeInput = z.infer<typeof newsletterSubscribeSchema>;

export interface NewsletterSubscribeResponse {
  email: string;
  isNew: boolean;
}
