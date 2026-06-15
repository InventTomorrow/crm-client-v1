import type { Metadata } from 'next';
import { WorkspaceView } from '@/features/onboarding/components/WorkspaceView';

export const metadata: Metadata = {
  title: 'Create workspace',
  description: 'Name your workspace to get started',
};

export default function OnboardingWorkspacePage() {
  return <WorkspaceView />;
}
