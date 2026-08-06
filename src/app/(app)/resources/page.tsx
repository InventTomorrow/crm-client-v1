import type { Metadata } from 'next';
import { ResourcesView } from '@/features/resources/components/ResourcesView';

export const metadata: Metadata = {
  title: 'Resources | AsaanRabta',
  description: 'Brochures, portfolios and case studies your bot shares with leads',
};

export default function ResourcesPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <ResourcesView />
    </div>
  );
}
