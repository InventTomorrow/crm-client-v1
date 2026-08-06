import {
  QUESTION_INPUT_TYPE_LABELS,
  SCORING_OPERATOR_LABELS,
  type QualificationForm,
  type QualificationQuestionFormData,
  type ScoringRuleFormData,
} from '../types';

/** The API answers `/qualification/form` with an unsaved default (no `id`) when the tenant has
 * never configured one — that, not an empty question list, is what "not set up yet" means. */
export function isQualificationConfigured(form: QualificationForm | undefined): boolean {
  return !!form?.id;
}

export interface QualificationBand {
  id: 'hot' | 'warm' | 'cold';
  label: string;
  range: string;
  /** Design token the band is tinted with. */
  color: string;
}

/** The three temperatures the thresholds carve a score into, read top-down the way a rep would
 * triage them. */
export function getQualificationBands(form: QualificationForm): QualificationBand[] {
  const warmCeiling = Math.max(form.hotThreshold - 1, form.warmThreshold);

  return [
    {
      id: 'hot',
      label: 'Hot',
      range: `${form.hotThreshold} and above`,
      color: 'var(--destructive)',
    },
    {
      id: 'warm',
      label: 'Warm',
      range:
        warmCeiling > form.warmThreshold
          ? `${form.warmThreshold} – ${warmCeiling}`
          : `${form.warmThreshold}`,
      color: 'var(--warning)',
    },
    {
      id: 'cold',
      label: 'Cold',
      range: `below ${form.warmThreshold}`,
      color: 'var(--info)',
    },
  ];
}

/** Highest total a lead can reach. Rules on the same question are alternatives — only one can
 * match — so each question contributes its best positive rule, not the sum of all of them. */
export function getMaxAchievableScore(form: QualificationForm): number {
  const bestPerQuestion = new Map<string, number>();

  for (const rule of form.scoringRules) {
    if (rule.score <= 0) continue;
    const currentBest = bestPerQuestion.get(rule.fieldName) ?? 0;
    if (rule.score > currentBest) bestPerQuestion.set(rule.fieldName, rule.score);
  }

  return [...bestPerQuestion.values()].reduce((total, score) => total + score, 0);
}

export function countRequiredQuestions(form: QualificationForm): number {
  return form.questions.filter((question) => question.isRequired).length;
}

export interface QuestionScoringGroup {
  fieldName: string;
  questionText: string;
  rules: ScoringRuleFormData[];
}

/** Rules grouped under the question they score, plus any rule left pointing at a question that
 * has since been renamed or removed — those score nothing and are worth surfacing. */
export function getScoringGroupsByQuestion(form: QualificationForm): {
  groups: QuestionScoringGroup[];
  orphanedRules: ScoringRuleFormData[];
} {
  const questionByFieldName = new Map(
    form.questions.map((question) => [question.fieldName, question]),
  );

  const groups = form.questions
    .map((question) => ({
      fieldName: question.fieldName,
      questionText: question.questionText,
      rules: form.scoringRules.filter((rule) => rule.fieldName === question.fieldName),
    }))
    .filter((group) => group.rules.length > 0);

  const orphanedRules = form.scoringRules.filter(
    (rule) => !questionByFieldName.has(rule.fieldName),
  );

  return { groups, orphanedRules };
}

/** One rule as a sentence: "is at least 100000 → +10". */
export function describeScoringRule(rule: ScoringRuleFormData): string {
  const signedScore = rule.score > 0 ? `+${rule.score}` : `${rule.score}`;
  return `${SCORING_OPERATOR_LABELS[rule.operator]} “${rule.value}” → ${signedScore}`;
}

export function describeQuestionInputType(question: QualificationQuestionFormData): string {
  return QUESTION_INPUT_TYPE_LABELS[question.inputType];
}

/** Questions whose answers are written back onto the lead record, for the mapping panel. */
export function getMappedLeadFields(
  form: QualificationForm,
): { leadField: string; fieldName: string }[] {
  return form.questions
    .filter((question) => !!question.mapsToLeadField)
    .map((question) => ({
      leadField: question.mapsToLeadField as string,
      fieldName: question.fieldName,
    }));
}
