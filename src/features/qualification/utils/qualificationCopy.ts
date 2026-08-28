"use client";
import { useCurrentTenant } from "@/features/tenant/hooks/useCurrentTenant";
import type { BusinessVertical } from "@/lib/business-verticals";
import { useMemo } from "react";

/**
 * Every string on the qualification screens that names what the workspace is
 * actually collecting. A marketing agency qualifies leads by budget; a clinic
 * takes an intake from a patient. Same form, same scoring — different words.
 *
 * Same shape as `labelByVertical` in the nav: one default set, and a partial
 * override per vertical, so a new vertical is one entry rather than an edit in
 * every component.
 */
export interface QualificationCopy {
  pageTitle: string;
  pageDescription: string;
  backLabel: string;

  statusDescription: string;
  statusToggleHint: string;
  questionsDescription: string;
  scoringDescription: string;
  thresholdsDescription: string;

  emptyTitle: string;
  emptyDescription: string;
  emptyAction: string;
  builderEmptyHint: string;

  dialogDescription: string;
  questionPlaceholder: string;
  optionPlaceholder: string;
  mapsToFieldLabel: string;

  scoringSummary: string;
  noScoringRules: string;
  /** Stat-card hint shown while no scoring rule exists. */
  noScoringRulesHint: string;
  mappedFieldsTitle: string;
  mappedFieldsDescription: string;
}

const DEFAULT_COPY: QualificationCopy = {
  pageTitle: "Bot questions",
  pageDescription:
    "What the bot asks a new lead, and how their answers score them.",
  backLabel: "Back to bot questions",

  statusDescription:
    "Turn the form off to let the bot chat without qualifying anyone.",
  statusToggleHint:
    "While off, leads still arrive — they just come in unscored.",
  questionsDescription:
    "Keep it short — every extra question is another chance for the lead to drop off.",
  scoringDescription:
    "Points awarded per answer, then compared against your thresholds.",
  thresholdsDescription:
    "Where a total score lands on the hot / warm / cold scale.",

  emptyTitle: "No questions yet",
  emptyDescription:
    "Leads still reach your pipeline — they just arrive unscored. Add questions and the bot will ask, score and sort them before anyone opens a chat.",
  emptyAction: "Add bot questions",
  builderEmptyHint:
    "Add the questions the bot should ask before a lead counts as qualified.",

  dialogDescription:
    "What the bot asks, and how the lead's answer gets stored.",
  questionPlaceholder: "What's your monthly marketing budget?",
  optionPlaceholder: "e.g. Under 50k",
  mapsToFieldLabel: "Save to lead field",

  scoringSummary:
    "Each matching rule adds its score. The total decides the lead's temperature.",
  noScoringRules: "No rules yet — every lead totals zero and lands as cold.",
  noScoringRulesHint: "Every lead scores zero",
  mappedFieldsTitle: "Saved to the lead",
  mappedFieldsDescription: "Answers written straight onto the lead record.",
};

const COPY_BY_VERTICAL: Partial<
  Record<BusinessVertical, Partial<QualificationCopy>>
> = {
  HEALTHCARE: {
    pageTitle: "Intake questions",
    pageDescription:
      "What the assistant asks a new patient before anyone from the clinic replies.",
    backLabel: "Back to intake questions",

    statusDescription:
      "Turn intake off to let the assistant answer questions without taking any details.",
    statusToggleHint:
      "While off, enquiries still arrive — they just come in without an intake.",
    questionsDescription:
      "Keep it short — a patient in distress abandons a long form, and a coordinator can always ask the rest.",
    scoringDescription:
      "Points awarded per answer, so the urgent enquiries surface first.",
    thresholdsDescription:
      "Where a total score lands on the urgent / follow-up / routine scale.",

    emptyTitle: "No intake questions yet",
    emptyDescription:
      "Enquiries still reach your inbox — they just arrive with nothing but a name. Add questions and the assistant will collect the details a coordinator would otherwise have to chase.",
    emptyAction: "Add intake questions",
    builderEmptyHint:
      "Add the details the assistant should collect before a coordinator picks up the enquiry.",

    dialogDescription:
      "What the assistant asks, and how the patient's answer gets stored.",
    questionPlaceholder: "What is the main problem you need help with?",
    optionPlaceholder: "e.g. Less than a week",
    mapsToFieldLabel: "Save to patient field",

    scoringSummary:
      "Each matching rule adds its score. The total decides how urgent the enquiry is.",
    noScoringRules:
      "No rules yet — every enquiry totals zero and lands as routine.",
    noScoringRulesHint: "Every enquiry scores zero",
    mappedFieldsTitle: "Saved to the patient",
    mappedFieldsDescription:
      "Answers written straight onto the patient record.",
  },
};

export function qualificationCopyFor(
  businessVertical: BusinessVertical | undefined,
): QualificationCopy {
  if (!businessVertical) return DEFAULT_COPY;
  return { ...DEFAULT_COPY, ...COPY_BY_VERTICAL[businessVertical] };
}

/** The wording for the workspace currently open. Stable while the vertical is,
 *  so callers can memoise derived structures (the wizard steps) against it. */
export function useQualificationCopy(): QualificationCopy {
  const { tenant } = useCurrentTenant();
  const businessVertical = tenant?.businessVertical;
  return useMemo(
    () => qualificationCopyFor(businessVertical),
    [businessVertical],
  );
}
