import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AccountRecoveryView } from '@/features/auth/components/AccountRecoveryView';

export const metadata: Metadata = {
  title: 'Recover account',
  description: 'Restore your deleted AsaanRabta account, or close it for good',
};

export default function AccountRecoveryPage() {
  return (
    <div className="w-full max-w-[420px]">
      <Suspense fallback={null}>
        <AccountRecoveryView />
      </Suspense>
    </div>
  );
}
