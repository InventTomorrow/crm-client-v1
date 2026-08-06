import type { Metadata } from 'next';
import { ServicesView } from '@/features/services/components/ServicesView';

export const metadata: Metadata = {
  title: 'Services | AsaanRabta',
  description: 'Manage your agency service offerings',
};

export default function ServicesPage() {
  return (
    <div className="p-4 md:p-8">
      <ServicesView />
    </div>
  );
}
