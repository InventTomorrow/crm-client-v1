import { z } from "zod";

/** Mirrors `submitContactSchema` on the server. */
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(80, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email")
    .max(160, "Email is too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .refine((value) => value === "" || value.length >= 7, {
      message: "Enter a valid phone number",
    }),
  subject: z
    .string()
    .trim()
    .min(3, "Enter a subject")
    .max(120, "Subject is too long"),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a bit more, at least 20 characters")
    .max(2000, "Message is too long"),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

export interface ContactMessageResponse {
  id: string;
  createdAt: string;
}
