import { ServiceOrdersView } from '@/features/service-orders/components/ServiceOrdersView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Service orders',
  description: 'Orders closed in chat, their payment status and receipts',
};

export default function ServiceOrdersPage() {
  return (
    <div className="scroll h-full w-full overflow-y-auto p-4 md:p-8">
      <h1 className="mb-5 text-[22px] font-semibold text-[var(--ink)]">Service orders</h1>
      <ServiceOrdersView />
    </div>
  );
}
