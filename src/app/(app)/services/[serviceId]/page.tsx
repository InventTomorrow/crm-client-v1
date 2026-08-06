import type { Metadata } from 'next';
import { ServicePreviewView } from '@/features/services/components/ServicePreviewView';

export const metadata: Metadata = {
  title: 'Service | AsaanRabta',
  description: 'Review a service offering in your agency catalog',
};

export default async function ServicePreviewPage({
  params,
}: {
  params: Promise<{ serviceId: string }>;
}) {
  const { serviceId } = await params;
  return (
    <div className="h-full">
      <ServicePreviewView serviceId={serviceId} />
    </div>
  );
}
