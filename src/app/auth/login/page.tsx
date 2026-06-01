import type { Metadata } from 'next';
import { LoginView } from '@/features/auth/components/LoginView';

export const metadata: Metadata = {
  title: 'Sign in — SaleFlow CRM',
  description: 'Sign in to your SaleFlow workspace',
};

export default function LoginPage() {
  return <LoginView />;
}
