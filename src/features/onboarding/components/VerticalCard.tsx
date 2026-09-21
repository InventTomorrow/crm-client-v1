import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  index: number;
  onSelect: () => void;
  /** `compact` is a horizontal row for dialogs and narrow panels. */
  variant?: 'default' | 'compact';
}

export function VerticalCard({
  icon: Icon,
  title,
  description,
  selected,
  disabled,
  index,
  onSelect,
  variant = 'default',
}: Props) {
  const isCompact = variant === 'compact';
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 * index }}
      className={cn(
        'flex text-left border transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        isCompact ? 'flex-row items-center gap-3 p-3 rounded-xl' : 'flex-col items-start gap-3 p-6 rounded-2xl',
        selected
          ? 'border-accent bg-accent-soft ring-2 ring-accent/20'
          : 'border-line bg-surface hover:border-accent hover:bg-surface-2',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center shrink-0 transition-colors',
          isCompact ? 'size-9 rounded-lg' : 'size-11 rounded-xl',
          selected ? 'bg-primary text-primary-foreground' : 'bg-surface-2 text-ink-mute',
        )}
      >
        <Icon size={isCompact ? 17 : 20} />
      </div>
      <div className="min-w-0">
        <div className={cn('font-semibold text-ink', isCompact ? 'text-[13px]' : 'text-[15px]')}>{title}</div>
        <p
          className={cn(
            'text-ink-mute',
            isCompact ? 'mt-0.5 text-[11.5px] leading-snug line-clamp-2' : 'mt-1 text-[12.5px] leading-relaxed',
          )}
        >
          {description}
        </p>
      </div>
    </motion.button>
  );
}
