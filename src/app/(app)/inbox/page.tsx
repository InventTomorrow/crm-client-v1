import type { Metadata } from 'next';
import { InboxView } from '@/features/inbox/components/InboxView';

export const metadata: Metadata = {
  title: 'Inbox — SaleFlow CRM',
  description: 'Unified inbox for all customer conversations',
};

export default function InboxPage() {
  return (
    <div className="h-full">
      <InboxView />
    </div>
  );
}
