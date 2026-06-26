import { Suspense } from 'react';
import type { Metadata } from 'next';
import { BillingView } from '@/features/billing/components/BillingView';

export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage your workspace plan, subscription, and payment history',
};

export default function BillingPage() {
  return (
    <div className="p-4 md:p-8">
      <Suspense fallback={null}>
        <BillingView />
      </Suspense>
    </div>
  );
}
