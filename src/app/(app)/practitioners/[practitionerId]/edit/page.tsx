import type { Metadata } from 'next';
import { PractitionerFormView } from '@/features/practitioners/components/PractitionerFormView';

export const metadata: Metadata = {
  title: 'Edit practitioner | AsaanRabta',
  description: 'Edit a doctor or therapist in your practice',
};

export default async function EditPractitionerPage({
  params,
}: {
  params: Promise<{ practitionerId: string }>;
}) {
  const { practitionerId } = await params;
  return (
    <div className="h-full">
      <PractitionerFormView practitionerId={practitionerId} />
    </div>
  );
}
