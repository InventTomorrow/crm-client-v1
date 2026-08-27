import type { Metadata } from 'next';
import { ClinicalServiceFormView } from '@/features/clinical-services/components/ClinicalServiceFormView';

export const metadata: Metadata = {
  title: 'Add service | AsaanRabta',
  description: 'Add a clinical service to your practice catalogue',
};

export default function NewClinicalServicePage() {
  return (
    <div className="h-full">
      <ClinicalServiceFormView />
    </div>
  );
}
