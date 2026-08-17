import Image from 'next/image';
import { OnboardingGate } from '@/features/onboarding/components/OnboardingGate';
import { Toaster } from '@/shared/ui/Sonner';
import type { Metadata } from 'next';
import { PRIVATE_PAGE_ROBOTS } from '@/shared/seo/metadata';

export const metadata: Metadata = {
  title: 'Setup',
  description: 'Complete your workspace setup',
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center px-8 bg-[var(--bg)]/95 backdrop-blur-sm border-b border-[var(--line)]">
        <Image src="/asaanrabta-logo.png" alt="AsaanRabta" width={150} height={49} priority className="h-7 w-auto" />
      </header>

      <main className="flex flex-col flex-1 items-center justify-center px-4 py-8 pt-16">
        <OnboardingGate>{children}</OnboardingGate>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
