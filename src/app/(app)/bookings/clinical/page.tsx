import type { Metadata } from 'next';
import { ClinicalBookingsView } from '@/features/bookings/components/ClinicalBookingsView';

export const metadata: Metadata = {
  title: 'Clinical bookings | AsaanRabta',
  description: 'Appointments booked with the clinic for a service',
};

export default function ClinicalBookingsPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <ClinicalBookingsView />
    </div>
  );
}
