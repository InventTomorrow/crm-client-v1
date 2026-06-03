import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InboxView } from '@/features/inbox/components/InboxView';

export const metadata: Metadata = {
  title: 'Inbox — SaleFlow CRM',
  description: 'Unified inbox for all customer conversations',
};

export default function InboxPage() {
  return (
    <div className="h-full">
      <Suspense fallback={null}>
        <InboxView />
      </Suspense>
    </div>
  );
}
