import type { Metadata } from 'next';
import { AvailabilityView } from '@/features/bookings/components/AvailabilityView';

export const metadata: Metadata = {
  title: 'Availability | AsaanRabta',
  description: 'Set the days, times and limits your bot may offer to leads',
};

export default function AvailabilityPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <AvailabilityView />
    </div>
  );
}
