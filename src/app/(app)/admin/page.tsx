import type { Metadata } from 'next';
import { TeamSection } from '@/features/settings/components/TeamSection';

export const metadata: Metadata = {
  title: 'Team & Access',
  description: 'Manage team members, roles, and workspace access controls',
};

export default function AdminPage() {
  return (
    <div className="scroll overflow-y-auto h-full p-4 md:p-6">
      <TeamSection />
    </div>
  );
}
