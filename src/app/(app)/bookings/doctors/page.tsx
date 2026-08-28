import type { Metadata } from 'next';
import { DoctorBookingsView } from '@/features/bookings/components/DoctorBookingsView';

export const metadata: Metadata = {
  title: 'Doctor bookings | AsaanRabta',
  description: 'Appointments booked with a named practitioner',
};

export default function DoctorBookingsPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <DoctorBookingsView />
    </div>
  );
}
