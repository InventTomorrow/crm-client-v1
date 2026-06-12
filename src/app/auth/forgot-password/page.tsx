import type { Metadata } from 'next';
import { ForgotPasswordView } from '@/features/auth/components/ForgotPasswordView';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your AsaanRabta account password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-[420px]">
      <ForgotPasswordView />
    </div>
  );
}
