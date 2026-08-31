import type { Metadata } from 'next';
import { ClinicalServiceFormView } from '@/features/clinical-services/components/ClinicalServiceFormView';

export const metadata: Metadata = {
  title: 'Edit service | AsaanRabta',
  description: 'Edit a clinical service in your practice catalogue',
};

export default async function EditClinicalServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <div className="h-full">
      <ClinicalServiceFormView serviceId={serviceId} />
    </div>
  );
}
