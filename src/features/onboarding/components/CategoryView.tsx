'use client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { BUSINESS_VERTICALS, type BusinessVertical } from '@/lib/business-verticals';
import { useSelectCategory } from '../hooks/useOnboarding';
import { OnboardingShell } from './OnboardingShell';
import { VerticalCard } from './VerticalCard';

export function CategoryView() {
  const [selected, setSelected] = useState<BusinessVertical | null>(null);
  const { mutate: selectCategory, isPending } = useSelectCategory();

  const handleSelect = (businessVertical: BusinessVertical) => {
    setSelected(businessVertical);
    selectCategory({ businessVertical });
  };

  return (
    <OnboardingShell currentStep="CATEGORY" wide>
      <div className="mb-8 text-center">
        <h1 className="text-[24px] font-semibold text-[var(--ink)]">What type of business do you run?</h1>
        <p className="text-[13.5px] mt-1.5 text-[var(--ink-mute)]">
          We&apos;ll tailor your AI assistant and workspace to match.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {BUSINESS_VERTICALS.map((vertical, index) => (
          <VerticalCard
            key={vertical.value}
            icon={vertical.icon}
            title={vertical.title}
            description={vertical.description}
            selected={selected === vertical.value}
            disabled={isPending}
            index={index}
            onSelect={() => handleSelect(vertical.value)}
          />
        ))}
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 mt-6 text-[12.5px] text-[var(--ink-mute)]">
          <Loader2 size={13} className="animate-spin" />
          Setting up your workspace…
        </div>
      )}
    </OnboardingShell>
  );
}
