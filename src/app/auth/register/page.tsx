import type { Metadata } from 'next';
import { RegisterView } from '@/features/auth/components/RegisterView';

export const metadata: Metadata = {
  title: 'Create workspace',
  description: 'Start selling smarter with AsaanRabta',
};

export default function RegisterPage() {
  return <RegisterView />;
}
