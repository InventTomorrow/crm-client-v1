"use client";
import { Accordion } from "@/shared/ui/Accordion";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/form";
import { FormAccordionSection } from "@/shared/ui/FormAccordionSection";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  ArrowLeft,
  Banknote,
  Clock,
  Eye,
  ListChecks,
  Loader2,
  ShieldAlert,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useClinicalServiceForm } from "../hooks/useClinicalServiceForm";
import type { ClinicalServiceFormSectionProps } from "../types";
import {
  NOTHING_FILLED_IN,
  type ClinicalServiceSectionId,
} from "../utils/clinicalServiceSectionSummaries";

import { ClinicalServiceBasicsFields } from "./sections/ClinicalServiceBasicsFields";
import { ClinicalServicePricingFields } from "./sections/ClinicalServicePricingFields";
import { ClinicalServiceSafetyFields } from "./sections/ClinicalServiceSafetyFields";
import { ClinicalServiceScopeFields } from "./sections/ClinicalServiceScopeFields";
import { ClinicalServiceTermsFields } from "./sections/ClinicalServiceTermsFields";
import { ClinicalServiceVisibilityFields } from "./sections/ClinicalServiceVisibilityFields";

const SECTIONS: {
  id: ClinicalServiceSectionId;
  Icon: LucideIcon;
  title: string;
  description: string;
  Fields: (props: ClinicalServiceFormSectionProps) => React.ReactNode;
}[] = [
  {
    id: "basics",
    Icon: Stethoscope,
    title: "Basics",
    description: "What this service is called and how it is grouped.",
    Fields: ClinicalServiceBasicsFields,
  },
  {
    id: "scope",
    Icon: ListChecks,
    title: "Clinical scope",
    description:
      "The assistant answers every scope question from these lists and nothing else.",
    Fields: ClinicalServiceScopeFields,
  },
  {
    id: "pricing",
    Icon: Banknote,
    title: "Pricing",
    description:
      "What the assistant may quote, and the shift arrangements it may offer.",
    Fields: ClinicalServicePricingFields,
  },
  {
    id: "terms",
    Icon: Clock,
    title: "Duration and terms",
    description: "Appointment length, minimum commitment and payment terms.",
    Fields: ClinicalServiceTermsFields,
  },
  {
    id: "safety",
    Icon: ShieldAlert,
    title: "Staffing and safety",
    description:
      "Who may deliver this service, and what must always be said about it.",
    Fields: ClinicalServiceSafetyFields,
  },
  {
    id: "visibility",
    Icon: Eye,
    title: "Visibility",
    description:
      "Whether the assistant may volunteer this service, and how it is booked.",
    Fields: ClinicalServiceVisibilityFields,
  },
];

export function ClinicalServiceFormView({ serviceId }: { serviceId?: string }) {
  const router = useRouter();
  const {
    form,
    isEditMode,
    isLoadingService,
    isSaving,
    handleSubmit,
    openSections,
    setOpenSections,
    summaries,
    erroredSections,
  } = useClinicalServiceForm(serviceId);

  const backToList = () => router.push("/clinical-services");

  if (isEditMode && isLoadingService) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-56" />
        {SECTIONS.map((section) => (
          <Skeleton key={section.id} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="w-full p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to services"
            onClick={backToList}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {isEditMode ? "Edit service" : "Add service"}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              Clinical services
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Accordion
              type="multiple"
              value={openSections}
              onValueChange={setOpenSections}
              className="gap-4"
            >
              {SECTIONS.map(({ id, Icon, title, description, Fields }) => (
                <FormAccordionSection
                  key={id}
                  value={id}
                  Icon={Icon}
                  title={title}
                  description={description}
                  summary={summaries[id]}
                  isEmpty={summaries[id] === NOTHING_FILLED_IN}
                  hasError={erroredSections.includes(id)}
                >
                  <Fields form={form} isSaving={isSaving} />
                </FormAccordionSection>
              ))}
            </Accordion>

            <div className="flex justify-end gap-2 pb-4">
              <Button
                type="button"
                variant="outline"
                onClick={backToList}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isEditMode ? "Save changes" : "Add service"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
