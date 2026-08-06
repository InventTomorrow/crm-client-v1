import type { Metadata } from 'next';
import { ServicePlansView } from '@/features/services/components/ServicePlansView';

export const metadata: Metadata = {
  title: 'Plans & pricing | AsaanRabta',
  description: 'Review pricing tiers across every service in your catalog',
};

export default function ServicePlansPage() {
  return (
    <div className="p-4 md:p-8">
      <ServicePlansView />
    </div>
  );
}
