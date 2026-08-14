import type { Metadata } from 'next';
import { BookingsView } from '@/features/bookings/components/BookingsView';

export const metadata: Metadata = {
  title: 'Bookings | AsaanRabta',
  description: 'Calls your bot and your team have booked with leads',
};

export default function BookingsPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <BookingsView />
    </div>
  );
}
