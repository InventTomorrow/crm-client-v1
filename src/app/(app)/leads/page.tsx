import type { Metadata } from 'next';
import { LeadsView } from '@/features/leads/components/LeadsView';

export const metadata: Metadata = {
  title: 'Leads — SaleFlow CRM',
  description: 'Manage your leads pipeline with Kanban, List, and Table views',
};

export default function LeadsPage() {
  return (
    <div className="h-full">
      <LeadsView />
    </div>
  );
}
