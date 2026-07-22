'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'WORKSPACE', label: 'Create workspace' },
  { key: 'CATEGORY', label: 'Business type' },
  { key: 'CHANNEL', label: 'Connect WhatsApp' },
  { key: 'CHATBOT', label: 'Configure chatbot' },
];

interface Props {
  currentStep: 'WORKSPACE' | 'CATEGORY' | 'CHANNEL' | 'CHATBOT';
  children: React.ReactNode;
  /** Wider column for steps that need more room, e.g. a card grid — default is the narrow form column. */
  wide?: boolean;
}

export function OnboardingShell({ currentStep, children, wide = false }: Props) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <motion.div
      key={currentStep}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={cn('w-full mx-auto', wide ? 'max-w-[900px]' : 'max-w-[520px]')}
    >
      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 transition-colors',
                i < currentIndex
                  ? 'bg-[var(--accent)] text-white'
                  : i === currentIndex
                  ? 'bg-[var(--accent)] text-white ring-4 ring-[rgba(79,195,247,0.2)]'
                  : 'bg-[var(--surface-2)] text-[var(--ink-mute)]',
              )}>
                {i < currentIndex ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-[12.5px] font-medium hidden sm:block',
                i === currentIndex ? 'text-[var(--ink)]' : 'text-[var(--ink-mute)]',
              )}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-px mx-3',
                i < currentIndex ? 'bg-[var(--accent)]' : 'bg-[var(--line)]',
              )} />
            )}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
