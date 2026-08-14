import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BillingView } from '@/features/billing/components/BillingView';

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your workspace plan, subscription, and payment history',
};

export default function BillingPage() {
  return (
    // .app-content is overflow:hidden, so each route owns its own scroll
    // container — without this the plan list is simply clipped.
    <div className="h-full overflow-y-auto p-4 md:p-8">
      <Suspense fallback={null}>
        <BillingView />
      </Suspense>
    </div>
  );
}
