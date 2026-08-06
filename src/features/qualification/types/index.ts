import { z } from 'zod';
import { MAX_FIELD_NAME_LENGTH } from '../utils/fieldName';

export const QUESTION_INPUT_TYPES = ['QUICK_REPLY', 'FREE_TEXT', 'NUMBER', 'EMAIL'] as const;
export type QuestionInputType = (typeof QUESTION_INPUT_TYPES)[number];

export const QUESTION_INPUT_TYPE_LABELS: Record<QuestionInputType, string> = {
  QUICK_REPLY: 'Quick reply (choose one)',
  FREE_TEXT: 'Free text',
  NUMBER: 'Number',
  EMAIL: 'Email',
};

export const SCORING_OPERATORS = ['EQUALS', 'CONTAINS', 'GTE', 'LTE'] as const;
export type ScoringOperator = (typeof SCORING_OPERATORS)[number];

export const SCORING_OPERATOR_LABELS: Record<ScoringOperator, string> = {
  EQUALS: 'equals',
  CONTAINS: 'contains',
  GTE: 'is at least',
  LTE: 'is at most',
};

export const LEAD_FIELD_MAPPINGS = ['name', 'email', 'phone', 'city'] as const;
export type LeadFieldMapping = (typeof LEAD_FIELD_MAPPINGS)[number];

/** Mirrors `qualificationQuestionSchema` on the server. `options` is only meaningful for
 * QUICK_REPLY, which the form enforces rather than the schema. */
export const qualificationQuestionFormSchema = z.object({
  order: z.number().int().nonnegative(),
  fieldName: z
    .string()
    .min(1, 'Field name is required')
    .max(MAX_FIELD_NAME_LENGTH, `Keep it under ${MAX_FIELD_NAME_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Use letters, numbers and underscores only'),
  questionText: z.string().min(1, 'Question text is required'),
  inputType: z.enum(QUESTION_INPUT_TYPES),
  options: z.array(z.string()).default([]),
  isRequired: z.boolean().default(true),
  mapsToLeadField: z.enum(LEAD_FIELD_MAPPINGS).nullable().optional(),
});

export const scoringRuleFormSchema = z.object({
  fieldName: z.string().min(1, 'Pick a question'),
  operator: z.enum(SCORING_OPERATORS),
  value: z.string().min(1, 'Value is required'),
  score: z.number().int(),
});

export const qualificationFormSchema = z
  .object({
    isActive: z.boolean().default(true),
    hotThreshold: z.number().int(),
    warmThreshold: z.number().int(),
    questions: z.array(qualificationQuestionFormSchema).min(1, 'Add at least one question'),
    scoringRules: z.array(scoringRuleFormSchema).default([]),
  })
  .refine((form) => form.hotThreshold > form.warmThreshold, {
    message: 'Hot threshold must be higher than the warm threshold',
    path: ['hotThreshold'],
  })
  .refine(
    (form) =>
      form.questions
        .filter((question) => question.inputType === 'QUICK_REPLY')
        .every((question) => question.options.filter(Boolean).length >= 2),
    {
      message: 'Quick reply questions need at least two options',
      path: ['questions'],
    },
  )
  .refine(
    (form) => new Set(form.questions.map((q) => q.fieldName)).size === form.questions.length,
    { message: 'Field names must be unique', path: ['questions'] },
  );

export type QualificationQuestionFormData = z.infer<typeof qualificationQuestionFormSchema>;
export type ScoringRuleFormData = z.infer<typeof scoringRuleFormSchema>;
export type QualificationFormData = z.infer<typeof qualificationFormSchema>;
/** Pre-parse shape — what react-hook-form actually holds, before defaults are applied. */
export type QualificationFormInput = z.input<typeof qualificationFormSchema>;

/** One lead's recorded answers and the score they add up to. */
export interface LeadQualification {
  id: string;
  tenantId: string;
  leadId: string;
  formVersion: number;
  answers: Record<string, string>;
  score: number;
  completedAt: string | null;
}

export interface QualificationForm {
  id?: string;
  tenantId: string;
  isActive: boolean;
  version: number;
  hotThreshold: number;
  warmThreshold: number;
  questions: QualificationQuestionFormData[];
  scoringRules: ScoringRuleFormData[];
}
