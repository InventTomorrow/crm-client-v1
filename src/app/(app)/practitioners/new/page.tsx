import type { Metadata } from 'next';
import { PractitionerFormView } from '@/features/practitioners/components/PractitionerFormView';

export const metadata: Metadata = {
  title: 'Add practitioner | AsaanRabta',
  description: 'Add a doctor or therapist to your practice',
};

export default function NewPractitionerPage() {
  return (
    <div className="h-full">
      <PractitionerFormView />
    </div>
  );
}
