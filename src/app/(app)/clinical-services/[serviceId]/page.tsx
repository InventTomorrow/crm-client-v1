import type { Metadata } from 'next';
import { ClinicalServiceDetailView } from '@/features/clinical-services/components/ClinicalServiceDetailView';

export const metadata: Metadata = {
  title: 'Service preview | AsaanRabta',
  description: 'How the assistant presents this clinical service to patients',
};

export default async function ClinicalServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <div className="h-full">
      <ClinicalServiceDetailView serviceId={serviceId} />
    </div>
  );
}
