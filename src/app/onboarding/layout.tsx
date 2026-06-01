import { Toaster } from '@/shared/ui/Sonner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup — SaleFlow CRM',
  description: 'Complete your workspace setup',
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="flex items-center px-8 py-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-[26px] h-[26px] rounded-[7px] bg-[linear-gradient(90deg,#4FC3F7,#7C3AED)] flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 14 L10 8 L14 12 L20 6" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[13.5px] font-semibold text-[var(--ink)] tracking-[-0.01em]">SaleFlow</span>
            <span className="text-[9.5px] text-[var(--ink-mute)] tracking-[0.18em] font-medium uppercase">CRM</span>
          </span>
        </div>
      </header>

      <main className="flex flex-col flex-1 items-center justify-center px-4 py-8">
        {children}
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
