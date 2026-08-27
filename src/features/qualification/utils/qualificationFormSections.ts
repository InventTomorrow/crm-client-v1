import type { FormWizardStep } from "@/shared/hooks/useFormWizard";
import { Calculator, Gauge, MessageSquare, Power } from "lucide-react";
import type { QualificationFormInput } from "../types";
import type { QualificationCopy } from "./qualificationCopy";

/** The qualification form, one section at a time. Completion mirrors the schema here rather
 * than tightening it — every saved form already satisfies these, so nothing is locked out.
 * Descriptions come from the workspace's vertical, so a clinic reads about patients. */
export function buildQualificationFormSteps(
  copy: QualificationCopy,
): FormWizardStep<QualificationFormInput>[] {
  return [
    {
      id: "status",
      label: "Status",
      title: "Status",
      description: copy.statusDescription,
      Icon: Power,
      fields: ["isActive"],
      // A boolean toggle is always in a valid state.
      isComplete: () => true,
      isOptional: true,
    },
    {
      id: "questions",
      label: "Questions",
      title: "Questions",
      description: copy.questionsDescription,
      Icon: MessageSquare,
      fields: ["questions"],
      isComplete: (values) => (values.questions?.length ?? 0) > 0,
    },
    {
      id: "scoring",
      label: "Scoring",
      title: "Scoring",
      description: copy.scoringDescription,
      Icon: Calculator,
      fields: ["scoringRules"],
      // Without rules every lead scores zero and lands cold — worth flagging, not worth blocking.
      isComplete: (values) => (values.scoringRules?.length ?? 0) > 0,
      isOptional: true,
    },
    {
      id: "thresholds",
      label: "Thresholds",
      title: "Thresholds",
      description: copy.thresholdsDescription,
      Icon: Gauge,
      fields: ["hotThreshold", "warmThreshold"],
      isComplete: (values) =>
        values.hotThreshold != null &&
        values.warmThreshold != null &&
        values.hotThreshold > values.warmThreshold,
    },
  ];
}
