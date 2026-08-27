import type { Metadata } from 'next';
import { ClinicalServicesView } from '@/features/clinical-services/components/ClinicalServicesView';

export const metadata: Metadata = {
  title: 'Services | AsaanRabta',
  description: 'Manage the clinical services your practice offers',
};

export default function ClinicalServicesPage() {
  return (
    <div className="p-4 md:p-8">
      <ClinicalServicesView />
    </div>
  );
}
