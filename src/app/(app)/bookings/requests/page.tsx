import type { Metadata } from 'next';
import { AppointmentRequestsView } from '@/features/bookings/components/AppointmentRequestsView';

export const metadata: Metadata = {
  title: 'Appointment requests | AsaanRabta',
  description: 'Appointments patients asked for in chat, waiting to be booked',
};

export default function AppointmentRequestsPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <AppointmentRequestsView />
    </div>
  );
}
