import type { Metadata } from 'next';
import { NotificationsView } from '@/features/notifications/components/NotificationsView';

export const metadata: Metadata = {
  title: 'Notifications',
  description: 'Your in-app notifications and delivery preferences',
};

export default function NotificationsPage() {
  return (
    <div className="p-4 md:p-8">
      <NotificationsView />
    </div>
  );
}
