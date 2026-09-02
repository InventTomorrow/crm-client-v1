import { pkr } from "@/lib/utils";
import { z } from "zod";

/** How a customer answers an option. Mirrors the server's CustomOptionInputType. */
export const CUSTOM_OPTION_INPUT_TYPES = [
  "TEXT",
  "NUMBER",
  "CHOICE",
  "MULTI_CHOICE",
  "IMAGE",
] as const;
export type CustomOptionInputType = (typeof CUSTOM_OPTION_INPUT_TYPES)[number];

export const PRICE_ADJUSTMENT_TYPES = ["FIXED", "PERCENT"] as const;
export type PriceAdjustmentType = (typeof PRICE_ADJUSTMENT_TYPES)[number];

/**
 * The three answers a seller picks between.
 *
 * NUMBER and MULTI_CHOICE still exist on the server and on options saved before
 * this form was simplified; they fold into TEXT and CHOICE here rather than
 * appearing as separate kinds — "they can pick more than one" is a checkbox
 * under the list, not a fourth question type.
 */
export const ANSWER_TYPES = ["TEXT", "CHOICE", "IMAGE"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export const ANSWER_TYPE_LABELS: Record<
  AnswerType,
  { label: string; hint: string }
> = {
  TEXT: { label: "They type it", hint: "A size, a name, a note" },
  CHOICE: { label: "They pick from a list", hint: "Only what you list below" },
  IMAGE: { label: "They send a photo", hint: "An image or file in the chat" },
};

/** Short label for a saved option's row. */
export const INPUT_TYPE_LABELS: Record<CustomOptionInputType, string> = {
  TEXT: "Typed",
  NUMBER: "Typed",
  CHOICE: "From a list",
  MULTI_CHOICE: "From a list",
  IMAGE: "Photo",
};

/** How a saved option maps onto the three buttons the form shows. */
export function toAnswerType(inputType: CustomOptionInputType): AnswerType {
  if (inputType === "IMAGE") return "IMAGE";
  return isChoiceType(inputType) ? "CHOICE" : "TEXT";
}

/** The reverse: the picked button plus the "more than one" checkbox. */
export function toInputType(
  answerType: AnswerType,
  allowsMultiple: boolean,
): CustomOptionInputType {
  if (answerType !== "CHOICE") return answerType;
  return allowsMultiple ? "MULTI_CHOICE" : "CHOICE";
}

/** What the seller does about money, as one choice instead of three controls. */
export const PRICING_MODES = ["FREE", "EXTRA", "QUOTE"] as const;
export type PricingMode = (typeof PRICING_MODES)[number];

export const PRICING_MODE_LABELS: Record<PricingMode, string> = {
  FREE: "No extra charge",
  EXTRA: "Costs extra",
  QUOTE: "We'll quote it",
};

export interface CustomOptionChoice {
  label: string;
  priceDelta: number;
  priceAdjustmentType: PriceAdjustmentType;
}

/**
 * One made-to-order option, owned by the workspace rather than by a product.
 *
 * `key` is the storage key the answer is filed under on an order line, and the
 * value a product holds in its `customOptionKeys`. It is derived server-side
 * from the label at creation and never changes, so it is never edited here.
 *
 * Mirrors the `ProductCustomOption` model on the server.
 */
export interface ProductCustomOption {
  id: string;
  tenantId: string;
  key: string;
  label: string;
  helpText: string | null;
  inputType: CustomOptionInputType;
  choices: CustomOptionChoice[];
  isRequired: boolean;
  priceDelta: number;
  priceAdjustmentType: PriceAdjustmentType;
  /** The team prices this by hand — the assistant quotes no number. */
  requiresQuote: boolean;
  leadTimeDays: number | null;
  /** False for made-to-order work that builds a new unit instead of using stock. */
  consumesStock: boolean;
  minQuantity: number;
  isActive: boolean;
  displayOrder: number;
  /** Seeded from the shipped defaults — a label only, not a restriction. */
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
}

/** The products still offering an option, shown before it is deleted. */
export interface CustomOptionUsage {
  id: string;
  name: string;
}

const choiceSchema = z.object({
  label: z.string().trim().min(1, "Every choice needs a name").max(60),
  priceDelta: z.coerce.number().min(0, "A surcharge cannot be negative").default(0),
  priceAdjustmentType: z.enum(PRICE_ADJUSTMENT_TYPES).default("FIXED"),
});

export const customOptionFormSchema = z
  .object({
    label: z.string().trim().min(1, "Give the option a name").max(80),
    helpText: z.string().trim().max(300).optional(),
    inputType: z.enum(CUSTOM_OPTION_INPUT_TYPES).default("TEXT"),
    choices: z.array(choiceSchema).max(30, "Keep it to 30 choices").default([]),
    isRequired: z.boolean().default(false),
    priceDelta: z.coerce.number().min(0, "A surcharge cannot be negative").default(0),
    priceAdjustmentType: z.enum(PRICE_ADJUSTMENT_TYPES).default("FIXED"),
    requiresQuote: z.boolean().default(false),
    leadTimeDays: z.coerce.number().int().min(0).max(365).optional(),
    consumesStock: z.boolean().default(true),
    minQuantity: z.coerce.number().int().min(1).default(1),
  })
  .refine(
    (value) =>
      value.priceAdjustmentType !== "PERCENT" || (value.priceDelta ?? 0) <= 100,
    { message: "A percentage surcharge cannot exceed 100%", path: ["priceDelta"] },
  )
  .refine(
    (value) =>
      !isChoiceType(value.inputType) || (value.choices?.length ?? 0) > 0,
    { message: "Add at least one choice", path: ["choices"] },
  );

export type CustomOptionFormData = z.infer<typeof customOptionFormSchema>;

/** CHOICE and MULTI_CHOICE price per choice rather than per option. */
export function isChoiceType(inputType: CustomOptionInputType): boolean {
  return inputType === "CHOICE" || inputType === "MULTI_CHOICE";
}

/** Which of the three pricing modes a saved option or draft is in. */
export function toPricingMode(value: {
  requiresQuote: boolean;
  priceDelta: number;
  choices: CustomOptionChoice[];
  inputType: CustomOptionInputType;
}): PricingMode {
  if (value.requiresQuote) return "QUOTE";
  const charges = isChoiceType(value.inputType)
    ? value.choices.some((choice) => choice.priceDelta > 0)
    : value.priceDelta > 0;
  return charges ? "EXTRA" : "FREE";
}

/** "No extra charge" / "+Rs. 500" / "We'll quote it" — one short label for a list row. */
export function describeSurcharge(option: ProductCustomOption): string {
  const mode = toPricingMode(option);
  if (mode !== "EXTRA") return PRICING_MODE_LABELS[mode];

  if (isChoiceType(option.inputType)) {
    const priced = option.choices.filter((choice) => choice.priceDelta > 0);
    const first = priced[0]!;
    const amount = formatSurcharge(first.priceDelta, first.priceAdjustmentType);
    return priced.length > 1 ? `From ${amount}` : amount;
  }
  return formatSurcharge(option.priceDelta, option.priceAdjustmentType);
}

/** Percent is legacy — kept readable, but never offered on new options. */
function formatSurcharge(amount: number, type: PriceAdjustmentType): string {
  return type === "PERCENT" ? `+${amount}%` : `+${pkr(amount)}`;
}
