import type { Metadata } from 'next';
import { ServiceFormView } from '@/features/services/components/ServiceFormView';

export const metadata: Metadata = {
  title: 'Add service | AsaanRabta',
  description: 'Add a new service offering to your agency catalog',
};

export default function NewServicePage() {
  return (
    <div className="h-full">
      <ServiceFormView />
    </div>
  );
}
