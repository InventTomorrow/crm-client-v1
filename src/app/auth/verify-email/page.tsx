import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerifyEmailView } from '@/features/auth/components/VerifyEmailView';

export const metadata: Metadata = {
  title: 'Check your inbox',
  description: 'Verify your email address to activate your account.',
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailView />
    </Suspense>
  );
}
