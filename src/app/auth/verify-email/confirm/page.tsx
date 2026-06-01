import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailConfirmView } from '@/features/auth/components/VerifyEmailConfirmView';

export const metadata: Metadata = {
  title: 'Verifying email — SalesHub CRM',
  description: 'Confirming your email verification link.',
};

export default function VerifyEmailConfirmPage() {
  return (
    <Suspense>
      <VerifyEmailConfirmView />
    </Suspense>
  );
}
