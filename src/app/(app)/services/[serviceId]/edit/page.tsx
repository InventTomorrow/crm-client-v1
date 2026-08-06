import type { Metadata } from 'next';
import { ServiceFormView } from '@/features/services/components/ServiceFormView';

export const metadata: Metadata = {
  title: 'Edit service | AsaanRabta',
  description: 'Edit a service offering in your agency catalog',
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <div className="h-full">
      <ServiceFormView serviceId={serviceId} />
    </div>
  );
}
