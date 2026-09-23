import { z } from "zod";
import {
  cleanText,
  getAccountNumberError,
  getIbanError,
  getInstructionsError,
  getNameError,
  normalizeAccountNumber,
  normalizeIban,
} from "../utils/paymentAccountRules";

export type { NotifSettings, UserProfile } from "@/lib/mockData";

// ──────────────────── Profile form ────────────────────
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

// ──────────────────── Chatbot config (mirrors server chatbot.dto) ────────────────────
export const botReplyLanguageSchema = z.enum(["MATCH_CUSTOMER", "ENGLISH", "ROMAN_URDU"]);
export type BotReplyLanguage = z.infer<typeof botReplyLanguageSchema>;

export const chatbotConfigSchema = z.object({
  greetingMessage: z.string().min(1, "Greeting message is required"),
  escalationMessage: z.string().min(1, "Escalation message is required"),
  fallbackMessage: z.string().min(1, "Fallback message is required"),
  aiPersonality: z.enum(["FORMAL", "CASUAL", "PERSUASIVE"]),
  replyLanguage: botReplyLanguageSchema,
});
export type ChatbotConfigForm = z.infer<typeof chatbotConfigSchema>;

// Mirrors the server's updateTenantSchema — the workspace name is not editable.
export const businessIdentitySchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(120),
});
export type BusinessIdentityForm = z.infer<typeof businessIdentitySchema>;

export const businessFaqSchema = z.object({
  question: z.string().min(1, "Question is required").max(300),
  answer: z.string().min(1, "Answer is required").max(1000),
});
export type BusinessFaq = z.infer<typeof businessFaqSchema>;

export const businessProfileSchema = z.object({
  businessDescription: z.string().max(2000),
  businessInfoMessage: z.string().max(2000),
  businessFaqs: z.array(businessFaqSchema).max(50),
  supportName: z.string().max(100),
  supportPhone: z.string().max(30),
  supportEmail: z
    .string()
    .max(200)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email",
    }),
  shareSupportContactOnHandoff: z.boolean(),
  notifyOnEscalation: z.boolean(),
  captureCustomizationRequests: z.boolean(),
});
export type BusinessProfileForm = z.infer<typeof businessProfileSchema>;

// ──────────────────── Payment accounts (mirrors server payment-details) ────────────────────
export const PAYMENT_ACCOUNT_METHODS = ["BANK_TRANSFER", "EASYPAISA", "JAZZCASH", "OTHER"] as const;
export const PAYMENT_METHOD_LABELS: Record<(typeof PAYMENT_ACCOUNT_METHODS)[number], string> = {
  BANK_TRANSFER: "Bank transfer",
  EASYPAISA: "Easypaisa",
  JAZZCASH: "JazzCash",
  OTHER: "Other",
};

/** Shape only — for lists holding saved accounts, which may predate today's rules. */
export const paymentAccountShapeSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9-]{1,64}$/),
  method: z.enum(PAYMENT_ACCOUNT_METHODS),
  accountTitle: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
  iban: z.string(),
  instructions: z.string(),
});

/** Same rules as the server: cleaned and normalised, then checked per payment method. Used when adding or editing one account. */
export const paymentAccountSchema = paymentAccountShapeSchema
  .transform((account) => ({
    ...account,
    accountTitle: cleanText(account.accountTitle),
    accountNumber: normalizeAccountNumber(account.method, account.accountNumber),
    bankName: cleanText(account.bankName),
    iban: normalizeIban(account.iban),
    instructions: cleanText(account.instructions),
  }))
  .superRefine((account, ctx) => {
    const issues: [keyof typeof account, string | null][] = [
      ["accountTitle", getNameError(account.accountTitle, "Account title")],
      ["accountNumber", getAccountNumberError(account.method, account.accountNumber)],
      [
        "bankName",
        account.bankName
          ? getNameError(account.bankName, "Bank name")
          : account.method === "BANK_TRANSFER"
            ? "Bank name is required for a bank transfer"
            : null,
      ],
      ["iban", getIbanError(account.method, account.iban)],
      ["instructions", getInstructionsError(account.instructions)],
    ];
    for (const [field, message] of issues) {
      if (message) ctx.addIssue({ code: "custom", path: [field], message });
    }
  });
export type PaymentAccountForm = z.infer<typeof paymentAccountSchema>;

export interface PaymentAccount {
  id: string;
  method: (typeof PAYMENT_ACCOUNT_METHODS)[number];
  accountTitle: string;
  accountNumber: string;
  bankName: string | null;
  iban: string | null;
  instructions: string | null;
}

/** Root fields the shared account editor reads — any form holding these can render it. */
export interface PaymentAccountsFieldValues {
  paymentAccounts: PaymentAccountForm[];
  defaultPaymentAccountId: string | null;
}

export const paymentAccountsSchema = z.object({
  paymentAccounts: z.array(paymentAccountShapeSchema).max(10, "Add at most 10 payment accounts"),
  defaultPaymentAccountId: z.string().nullable(),
});
export type PaymentAccountsForm = z.infer<typeof paymentAccountsSchema>;

// Invite a workspace member. Only email + roleId are persisted by the API; the
// invitee sets their own name when they accept. city/phone are captured for
// display and future use.
export const inviteMemberSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  roleId: z.string().min(1, "Select a role"),
  city: z.string().max(60).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
});
export type InviteMemberForm = z.infer<typeof inviteMemberSchema>;

// Full config returned by GET /chatbot/config
export interface ChatbotConfigResponse {
  config: {
    greetingMessage: string;
    escalationMessage: string;
    fallbackMessage: string;
    aiPersonality: "FORMAL" | "CASUAL" | "PERSUASIVE";
    aiEnabled: boolean;
    replyLanguage: BotReplyLanguage;
    paymentAccounts: PaymentAccount[];
    defaultPaymentAccountId: string | null;
    businessDescription: string | null;
    businessInfoMessage: string | null;
    businessFaqs: BusinessFaq[] | null;
    supportName: string | null;
    supportPhone: string | null;
    supportEmail: string | null;
    shareSupportContactOnHandoff: boolean;
    notifyOnEscalation: boolean;
    captureCustomizationRequests: boolean;
  } | null;
  workspaceName: string | null;
}

export const CHANNELS_DATA = [
  {
    ch: "wa" as const,
    name: "WhatsApp Business",
    acct: "Scan QR to connect",
    status: "disconnected",
    date: "",
  },
] as const;

export const SYSTEM_STATS = [
  { l: "AI Latency", v: "142ms", ok: true },
  { l: "Uptime (30d)", v: "99.98%", ok: true },
  { l: "Encryption", v: "AES-256", ok: true },
  { l: "Sync (Shopify)", v: "Live", ok: true },
] as const;
