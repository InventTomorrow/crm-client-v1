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
}

export function VerticalCard({ icon: Icon, title, description, selected, disabled, index, onSelect }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 * index }}
      className={cn(
        'flex flex-col items-start gap-3 p-6 rounded-2xl border text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        selected
          ? 'border-[var(--accent)] bg-[rgba(79,195,247,0.06)] ring-2 ring-[rgba(79,195,247,0.25)]'
          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:bg-[rgba(79,195,247,0.03)]',
      )}
    >
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
          selected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-2)] text-[var(--ink-mute)]',
        )}
      >
        <Icon size={20} />
      </div>
      <div>
        <div className="text-[15px] font-semibold text-[var(--ink)]">{title}</div>
        <p className="text-[12.5px] mt-1 text-[var(--ink-mute)] leading-relaxed">{description}</p>
      </div>
    </motion.button>
  );
}
