import { z } from "zod";

export const leadStatusEnum = z.enum(
  ["prospect", "cold", "warm", "hot", "closed"],
  {
    message: "Status is required",
  },
);

export const leadChannelEnum = z.enum(["wa"], {
  message: "Channel is required",
});

export const leadFormSchema = z.object({
  name: z
    .string({ message: "Customer name is required" })
    .trim()
    .min(2, "Customer name must be at least 2 characters")
    .max(100, "Customer name cannot exceed 100 characters"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^\+?[0-9\s\-()]{7,20}$/.test(val),
      "Please enter a valid phone number (7-20 digits)",
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .trim()
    .max(100, "City name cannot exceed 100 characters")
    .optional(),
  channel: leadChannelEnum,
  status: leadStatusEnum,
});

export type LeadFormData = z.infer<typeof leadFormSchema>;
