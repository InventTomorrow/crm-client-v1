import type { Metadata } from 'next';
import { AdminView } from '@/features/admin/components/AdminView';

export const metadata: Metadata = {
  title: 'Team & Access',
  description: 'Manage team members, roles, and workspace access controls',
};

export default function AdminPage() {
  return (
    <div className="h-full">
      <AdminView />
    </div>
  );
}
