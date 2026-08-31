import type { BusinessVertical } from "@/lib/business-verticals";
import type { LeadFieldMapping, QuestionInputType } from "../types";

/**
 * A ready-made question the owner can drop in instead of wording one from
 * scratch. Picking one fills the whole dialog — answer type, options and lead
 * mapping included — and everything stays editable afterwards.
 */
export interface SuggestedQuestion {
  questionText: string;
  inputType: QuestionInputType;
  options: string[];
  isRequired: boolean;
  mapsToLeadField: LeadFieldMapping | null;
}

const AGENCY_QUESTIONS: SuggestedQuestion[] = [
  {
    questionText: "What's your monthly marketing budget?",
    inputType: "QUICK_REPLY",
    options: ["Under 50k", "50k–150k", "150k–500k", "Over 500k"],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "Which service are you interested in?",
    inputType: "FREE_TEXT",
    options: [],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "How soon do you want to start?",
    inputType: "QUICK_REPLY",
    options: ["This week", "This month", "Next quarter", "Just researching"],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "What should we call you?",
    inputType: "FREE_TEXT",
    options: [],
    isRequired: true,
    mapsToLeadField: "name",
  },
  {
    questionText: "What email should we send the proposal to?",
    inputType: "EMAIL",
    options: [],
    isRequired: false,
    mapsToLeadField: "email",
  },
];

/**
 * Clinic intake. Ordered the way a coordinator would ask: what is wrong, for how
 * long, who for, then the logistics. Nothing here asks for a diagnosis — the
 * assistant collects facts, it does not triage.
 */
const HEALTHCARE_QUESTIONS: SuggestedQuestion[] = [
  {
    questionText: "What is the main problem you need help with?",
    inputType: "FREE_TEXT",
    options: [],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "How long has this been going on?",
    inputType: "QUICK_REPLY",
    options: [
      "Less than a week",
      "1–4 weeks",
      "1–6 months",
      "More than 6 months",
    ],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "Who is the appointment for?",
    inputType: "QUICK_REPLY",
    options: ["Myself", "A parent", "A child", "Someone else"],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "What is the patient's age?",
    inputType: "NUMBER",
    options: [],
    isRequired: false,
    mapsToLeadField: null,
  },
  {
    questionText: "How soon do you need to be seen?",
    inputType: "QUICK_REPLY",
    options: ["Today", "This week", "This month", "Just asking for now"],
    isRequired: true,
    mapsToLeadField: null,
  },
  {
    questionText: "Do you need care at home or at the clinic?",
    inputType: "QUICK_REPLY",
    options: ["At home", "At the clinic", "Not sure yet"],
    isRequired: false,
    mapsToLeadField: null,
  },
  {
    questionText: "Have you seen a doctor for this already?",
    inputType: "QUICK_REPLY",
    options: ["Yes", "No"],
    isRequired: false,
    mapsToLeadField: null,
  },
  {
    questionText: "Which city are you in?",
    inputType: "FREE_TEXT",
    options: [],
    isRequired: true,
    mapsToLeadField: "city",
  },
  {
    questionText: "What is the patient's name?",
    inputType: "FREE_TEXT",
    options: [],
    isRequired: true,
    mapsToLeadField: "name",
  },
];

const QUESTIONS_BY_VERTICAL: Partial<
  Record<BusinessVertical, SuggestedQuestion[]>
> = {
  HEALTHCARE: HEALTHCARE_QUESTIONS,
};

export function suggestedQuestionsFor(
  businessVertical: BusinessVertical | undefined,
): SuggestedQuestion[] {
  if (!businessVertical) return AGENCY_QUESTIONS;
  return QUESTIONS_BY_VERTICAL[businessVertical] ?? AGENCY_QUESTIONS;
}

/**
 * The ready-made list plus the questions this workspace has already written, so
 * the suggestions never shrink as the form fills up and an existing question can
 * be reused as the starting point for the next one.
 */
export function mergeQuestionSuggestions(
  defaults: SuggestedQuestion[],
  existing: SuggestedQuestion[],
): SuggestedQuestion[] {
  const seen = new Set(
    defaults.map((suggestion) => suggestion.questionText.trim().toLowerCase()),
  );

  const additions = existing.filter((suggestion) => {
    const key = suggestion.questionText.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return [...defaults, ...additions];
}
