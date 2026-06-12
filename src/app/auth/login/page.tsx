import type { Metadata } from 'next';
import { LoginView } from '@/features/auth/components/LoginView';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your AsaanRabta workspace',
};

export default function LoginPage() {
  return <LoginView />;
}
