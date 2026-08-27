import type { Metadata } from 'next';
import { CoverageAreasView } from '@/features/clinic-coverage/components/CoverageAreasView';

export const metadata: Metadata = {
  title: 'Coverage areas | AsaanRabta',
  description:
    'Manage where your clinic operates and which services it offers in each area',
};

export default function CoverageAreasPage() {
  return (
    <div className="p-4 md:p-8">
      <CoverageAreasView />
    </div>
  );
}
