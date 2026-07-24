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
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-8 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--line)]">
        <Image src="/asaanrabta-logo.png" alt="AsaanRabta" width={150} height={49} priority className="h-7 w-auto" />
      </header>

      <main className="flex flex-col flex-1 items-center justify-center px-4 py-8 pt-16">
        {children}
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
