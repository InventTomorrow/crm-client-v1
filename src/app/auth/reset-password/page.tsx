import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordView } from '@/features/auth/components/ResetPasswordView';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Set a new password for your account',
};

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense>
        <ResetPasswordView />
      </Suspense>
    </div>
  );
}
