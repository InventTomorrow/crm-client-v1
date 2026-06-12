import type { Metadata } from 'next';
import { SettingsView } from '@/features/settings/components/SettingsView';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile, notifications, channels, and workspace settings',
};

export default function SettingsPage() {
  return (
    <div className="h-full">
      <SettingsView />
    </div>
  );
}
