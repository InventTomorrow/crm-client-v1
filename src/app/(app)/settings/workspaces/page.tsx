import type { Metadata } from 'next';
import { WorkspacesManagementView } from '@/features/settings/components/WorkspacesManagementView';

export const metadata: Metadata = {
  title: 'Workspaces',
  description: 'Manage all your workspaces — view stats, switch context, create or delete workspaces.',
};

export default function WorkspacesPage() {
  return (
    <div className="h-full">
      <WorkspacesManagementView />
    </div>
  );
}
