import { CustomizationRequestsView } from '@/features/customization-requests/components/CustomizationRequestsView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customization requests',
  description: 'Answer the customization requests waiting on your team',
};

export default function CustomizationRequestsPage() {
  return (
    <div className="scroll h-full w-full overflow-y-auto p-4">
      <h1 className="text-[22px] font-semibold text-[var(--ink)] mb-5">
        Customization requests
      </h1>
      <CustomizationRequestsView />
    </div>
  );
}
