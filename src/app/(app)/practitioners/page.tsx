import type { Metadata } from 'next';
import { PractitionersView } from '@/features/practitioners/components/PractitionersView';

export const metadata: Metadata = {
  title: 'Practitioners | AsaanRabta',
  description: 'Manage doctor and therapist profiles, visibility and working hours',
};

export default function PractitionersPage() {
  return (
    <div className="p-4 md:p-8">
      <PractitionersView />
    </div>
  );
}
