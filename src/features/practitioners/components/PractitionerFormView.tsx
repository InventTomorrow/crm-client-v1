"use client";
import { useBookingConfigQuery } from "@/features/bookings/hooks/useBookings";
import { Form } from "@/shared/ui/form";
import { FormWizard, type WizardStep } from "@/shared/ui/FormWizard";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  CalendarClock,
  Eye,
  FileText,
  GraduationCap,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import {
  PRACTITIONER_STEP_ORDER,
  usePractitionerWizard,
} from "../hooks/usePractitionerWizard";
import {
  NOTHING_FILLED_IN,
  type PractitionerSectionId,
} from "../utils/practitionerSectionSummaries";
import { PractitionerExpertiseFields } from "./sections/PractitionerExpertiseFields";
import { PractitionerIdentityFields } from "./sections/PractitionerIdentityFields";
import { PractitionerProfileFields } from "./sections/PractitionerProfileFields";
import { PractitionerScheduleSection } from "./sections/PractitionerScheduleSection";
import { PractitionerVisibilityFields } from "./sections/PractitionerVisibilityFields";

const STEP_META: Record<
  PractitionerSectionId,
  { Icon: LucideIcon; title: string; description: string }
> = {
  identity: {
    Icon: UserRound,
    title: "Identity",
    description: "Who this person is, and the photo patients see.",
  },
  expertise: {
    Icon: GraduationCap,
    title: "Expertise",
    description:
      "What they treat and what they are qualified in — the assistant matches patients on these.",
  },
  profile: {
    Icon: FileText,
    title: "Profile and fee",
    description:
      "What patients read about them, and what a consultation costs.",
  },
  schedule: {
    Icon: CalendarClock,
    title: "Schedule",
    description: "Their own hours, or the clinic hours when left blank.",
  },
  visibility: {
    Icon: Eye,
    title: "Visibility",
    description:
      "Whether the assistant may name this person, and whether it may book them.",
  },
};

export function PractitionerFormView({
  practitionerId,
}: {
  practitionerId?: string;
}) {
  const {
    form,
    isCreating,
    isLoadingPractitioner,
    isSaving,
    stepIndex,
    furthestStepIndex,
    summaries,
    erroredSections,
    goToStep,
    goBack,
    goNext,
    saveAll,
    backToList,
    savedLabel,
  } = usePractitionerWizard(practitionerId);

  const bookingConfigQuery = useBookingConfigQuery();
  const workspaceVisibility =
    bookingConfigQuery.data?.practitionerVisibility ?? "HIDDEN";
  const clinicDefaults = {
    durationMinutes: bookingConfigQuery.data?.durationMinutes ?? 30,
    bufferMinutes: bookingConfigQuery.data?.bufferMinutes ?? 0,
    maxPerDay: bookingConfigQuery.data?.maxPerDay ?? 8,
  };

  if (isLoadingPractitioner) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  const steps: WizardStep[] = PRACTITIONER_STEP_ORDER.map((id) => ({
    id,
    ...STEP_META[id],
    summary: summaries[id],
    isEmpty: summaries[id] === NOTHING_FILLED_IN,
    hasError: erroredSections.includes(id),
  }));

  const stepBody: Record<PractitionerSectionId, React.ReactNode> = {
    identity: <PractitionerIdentityFields form={form} isSaving={isSaving} />,
    expertise: <PractitionerExpertiseFields form={form} isSaving={isSaving} />,
    profile: <PractitionerProfileFields form={form} isSaving={isSaving} />,
    schedule: (
      <PractitionerScheduleSection
        form={form}
        isSaving={isSaving}
        clinicDefaults={clinicDefaults}
      />
    ),
    visibility: (
      <PractitionerVisibilityFields
        form={form}
        isSaving={isSaving}
        workspaceVisibility={workspaceVisibility}
      />
    ),
  };

  return (
    <Form {...form}>
      <FormWizard
        heading={isCreating ? "Add practitioner" : "Edit practitioner"}
        subheading="Practitioners"
        steps={steps}
        currentStepIndex={stepIndex}
        furthestStepIndex={furthestStepIndex}
        onStepSelect={(nextStepIndex) => void goToStep(nextStepIndex)}
        onBack={goBack}
        onNext={() => void goNext()}
        onCancel={backToList}
        isSaving={isSaving}
        submitLabel={isCreating ? "Add practitioner" : "Save changes"}
        onSaveAll={isCreating ? undefined : () => void saveAll()}
        savedLabel={savedLabel}
      >
        {stepBody[PRACTITIONER_STEP_ORDER[stepIndex]!]}
      </FormWizard>
    </Form>
  );
}
