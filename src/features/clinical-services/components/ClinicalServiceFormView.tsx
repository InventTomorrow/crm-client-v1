"use client";
import { Form } from "@/shared/ui/form";
import { FormWizard, type WizardStep } from "@/shared/ui/FormWizard";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  Banknote,
  ClipboardList,
  Clock,
  Eye,
  ListChecks,
  ShieldAlert,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import {
  CLINICAL_SERVICE_STEP_ORDER,
  useClinicalServiceWizard,
} from "../hooks/useClinicalServiceWizard";
import type { ClinicalServiceFormSectionProps } from "../types";
import {
  NOTHING_FILLED_IN,
  type ClinicalServiceSectionId,
} from "../utils/clinicalServiceSectionSummaries";
import { ClinicalServiceBasicsFields } from "./sections/ClinicalServiceBasicsFields";
import { ClinicalServiceIntakeFields } from "./sections/ClinicalServiceIntakeFields";
import { ClinicalServicePricingFields } from "./sections/ClinicalServicePricingFields";
import { ClinicalServiceSafetyFields } from "./sections/ClinicalServiceSafetyFields";
import { ClinicalServiceScopeFields } from "./sections/ClinicalServiceScopeFields";
import { ClinicalServiceTermsFields } from "./sections/ClinicalServiceTermsFields";
import { ClinicalServiceVisibilityFields } from "./sections/ClinicalServiceVisibilityFields";

const STEP_META: Record<
  ClinicalServiceSectionId,
  {
    Icon: LucideIcon;
    title: string;
    description: string;
    Fields: (props: ClinicalServiceFormSectionProps) => React.ReactNode;
  }
> = {
  basics: {
    Icon: Stethoscope,
    title: "Basics",
    description: "What this service is called and how it is grouped.",
    Fields: ClinicalServiceBasicsFields,
  },
  scope: {
    Icon: ListChecks,
    title: "Clinical scope",
    description:
      "The assistant answers every scope question from these lists and nothing else.",
    Fields: ClinicalServiceScopeFields,
  },
  intake: {
    Icon: ClipboardList,
    title: "Intake questions",
    description:
      "What the assistant asks a family before handing the case to a coordinator.",
    Fields: ClinicalServiceIntakeFields,
  },
  pricing: {
    Icon: Banknote,
    title: "Pricing",
    description:
      "What the assistant may quote, and the shift arrangements it may offer.",
    Fields: ClinicalServicePricingFields,
  },
  terms: {
    Icon: Clock,
    title: "Duration and terms",
    description: "Appointment length, minimum commitment and payment terms.",
    Fields: ClinicalServiceTermsFields,
  },
  safety: {
    Icon: ShieldAlert,
    title: "Staffing and safety",
    description:
      "Who may deliver this service, and what must always be said about it.",
    Fields: ClinicalServiceSafetyFields,
  },
  visibility: {
    Icon: Eye,
    title: "Visibility",
    description:
      "Whether the assistant may volunteer this service, and how it is booked.",
    Fields: ClinicalServiceVisibilityFields,
  },
};

export function ClinicalServiceFormView({ serviceId }: { serviceId?: string }) {
  const {
    form,
    isCreating,
    isLoadingService,
    isSaving,
    stepIndex,
    furthestStepIndex,
    summaries,
    erroredSections,
    goToStep,
    goBack,
    goNext,
    backToList,
    savedLabel,
  } = useClinicalServiceWizard(serviceId);

  if (isLoadingService) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const steps: WizardStep[] = CLINICAL_SERVICE_STEP_ORDER.map((id) => ({
    id,
    Icon: STEP_META[id].Icon,
    title: STEP_META[id].title,
    description: STEP_META[id].description,
    summary: summaries[id],
    isEmpty: summaries[id] === NOTHING_FILLED_IN,
    hasError: erroredSections.includes(id),
  }));

  const CurrentFields = STEP_META[CLINICAL_SERVICE_STEP_ORDER[stepIndex]!].Fields;

  return (
    <Form {...form}>
      <FormWizard
        heading={isCreating ? "Add service" : "Edit service"}
        subheading="Clinical services"
        steps={steps}
        currentStepIndex={stepIndex}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={(nextStepIndex) => void goToStep(nextStepIndex)}
        onBack={goBack}
        onNext={() => void goNext()}
        onCancel={backToList}
        isSaving={isSaving}
        submitLabel={isCreating ? "Add service" : "Save changes"}
        savedLabel={savedLabel}
      >
        <div className="flex flex-col divide-y divide-[var(--line)] [&>*+*]:pt-5 [&>*]:pb-5 [&>*:last-child]:pb-0">
          <CurrentFields form={form} isSaving={isSaving} />
        </div>
      </FormWizard>
    </Form>
  );
}
