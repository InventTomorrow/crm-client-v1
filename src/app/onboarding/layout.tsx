import Image from 'next/image';
import { Toaster } from '@/shared/ui/Sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup',
  description: 'Complete your workspace setup',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center px-8 py-5 flex-shrink-0">
        <Image src="/asaanrabta-logo.png" alt="AsaanRabta" width={150} height={49} priority className="h-7 w-auto" />
      </header>

      <main className="flex flex-col flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
