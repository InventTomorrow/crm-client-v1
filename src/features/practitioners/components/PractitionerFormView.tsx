'use client';
import { useBookingConfigQuery } from '@/features/bookings/hooks/useBookings';
import { Accordion } from '@/shared/ui/Accordion';
import { Button } from '@/shared/ui/Button';
import { Form } from '@/shared/ui/form';
import { FormAccordionSection } from '@/shared/ui/FormAccordionSection';
import { Skeleton } from '@/shared/ui/Skeleton';
import {
  ArrowLeft,
  CalendarClock,
  Eye,
  GraduationCap,
  Loader2,
  UserRound,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePractitionerForm } from '../hooks/usePractitionerForm';
import {
  NOTHING_FILLED_IN,
  type PractitionerSectionId,
} from '../utils/practitionerSectionSummaries';
import { PractitionerExpertiseFields } from './sections/PractitionerExpertiseFields';
import { PractitionerIdentityFields } from './sections/PractitionerIdentityFields';
import { PractitionerProfileFields } from './sections/PractitionerProfileFields';
import { PractitionerScheduleSection } from './sections/PractitionerScheduleSection';
import { PractitionerVisibilityFields } from './sections/PractitionerVisibilityFields';

const SECTION_META: {
  id: PractitionerSectionId;
  Icon: typeof UserRound;
  title: string;
  description: string;
}[] = [
  {
    id: 'identity',
    Icon: UserRound,
    title: 'Identity',
    description: 'Who this person is, and the photo patients see.',
  },
  {
    id: 'expertise',
    Icon: GraduationCap,
    title: 'Expertise',
    description:
      'What they treat and what they are qualified in — the assistant matches patients on these.',
  },
  {
    id: 'profile',
    Icon: FileText,
    title: 'Profile and fee',
    description: 'What patients read about them, and what a consultation costs.',
  },
  {
    id: 'visibility',
    Icon: Eye,
    title: 'Visibility',
    description:
      'Whether the assistant may name this person, and whether it may book them.',
  },
  {
    id: 'schedule',
    Icon: CalendarClock,
    title: 'Schedule',
    description: 'Their own hours, or the clinic hours when left blank.',
  },
];

export function PractitionerFormView({
  practitionerId,
}: {
  practitionerId?: string;
}) {
  const router = useRouter();
  const {
    form,
    isEditMode,
    isLoadingPractitioner,
    isSaving,
    handleSubmit,
    openSections,
    setOpenSections,
    summaries,
    erroredSections,
  } = usePractitionerForm(practitionerId);

  const bookingConfigQuery = useBookingConfigQuery();
  const workspaceVisibility =
    bookingConfigQuery.data?.practitionerVisibility ?? 'HIDDEN';
  const clinicDefaults = {
    durationMinutes: bookingConfigQuery.data?.durationMinutes ?? 30,
    bufferMinutes: bookingConfigQuery.data?.bufferMinutes ?? 0,
    maxPerDay: bookingConfigQuery.data?.maxPerDay ?? 8,
  };

  const backToList = () => router.push('/practitioners');

  if (isEditMode && isLoadingPractitioner) {
    return (
      <div className="flex w-full flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-56" />
        {SECTION_META.map((section) => (
          <Skeleton key={section.id} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const sectionBody: Record<PractitionerSectionId, React.ReactNode> = {
    identity: <PractitionerIdentityFields form={form} isSaving={isSaving} />,
    expertise: <PractitionerExpertiseFields form={form} isSaving={isSaving} />,
    profile: <PractitionerProfileFields form={form} isSaving={isSaving} />,
    visibility: (
      <PractitionerVisibilityFields
        form={form}
        isSaving={isSaving}
        workspaceVisibility={workspaceVisibility}
      />
    ),
    schedule: (
      <PractitionerScheduleSection
        form={form}
        isSaving={isSaving}
        clinicDefaults={clinicDefaults}
      />
    ),
  };

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="w-full p-4 md:p-8">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to practitioners"
            onClick={backToList}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">
              {isEditMode ? 'Edit practitioner' : 'Add practitioner'}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">Practitioners</p>
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
              {SECTION_META.map(({ id, Icon, title, description }) => (
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
                  {sectionBody[id]}
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
                {isEditMode ? 'Save changes' : 'Add practitioner'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
