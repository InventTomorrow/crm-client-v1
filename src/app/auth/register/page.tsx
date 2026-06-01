import type { Metadata } from 'next';
import { RegisterView } from '@/features/auth/components/RegisterView';

export const metadata: Metadata = {
  title: 'Create workspace — SaleFlow CRM',
  description: 'Start selling smarter with SaleFlow CRM',
};

export default function RegisterPage() {
  return <RegisterView />;
}
