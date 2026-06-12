import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AcceptInviteView } from '@/features/auth/components/AcceptInviteView';

export const metadata: Metadata = {
  title: 'Accept invitation',
  description: 'Join your team on AsaanRabta',
};

export default function AcceptInvitePage() {
  return (
    <div className="w-full max-w-[460px]">
      <Suspense>
        <AcceptInviteView />
      </Suspense>
    </div>
  );
}
