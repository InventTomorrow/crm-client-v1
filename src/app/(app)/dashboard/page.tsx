import type { Metadata } from 'next';
import { AnalyticsView } from '@/features/analytics/components/AnalyticsView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'WhatsApp status, KPIs, leads vs orders trends, lead funnel and AI handoff analytics',
};

export default function DashboardPage() {
  return (
    <div className="h-full">
      <AnalyticsView />
    </div>
  );
}
