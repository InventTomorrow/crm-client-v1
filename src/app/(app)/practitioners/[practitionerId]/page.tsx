import type { Metadata } from 'next';
import { PractitionerDetailView } from '@/features/practitioners/components/PractitionerDetailView';

export const metadata: Metadata = {
  title: 'Practitioner preview | AsaanRabta',
  description: 'How the assistant presents this practitioner to patients',
};

export default async function PractitionerPage({
  params,
}: {
  params: Promise<{ practitionerId: string }>;
}) {
  const { practitionerId } = await params;
  return (
    <div className="h-full">
      <PractitionerDetailView practitionerId={practitionerId} />
    </div>
  );
}
