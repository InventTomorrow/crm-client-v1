'use client';
import { Megaphone } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface ServicesEmptyStateProps {
  onAdd: () => void;
}

export function ServicesEmptyState({ onAdd }: ServicesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface-2)] flex items-center justify-center">
        <Megaphone size={24} className="text-[var(--ink-mute)]" />
      </div>
      <div>
        <p className="font-semibold text-[var(--ink)]">No services yet</p>
        <p className="text-sm text-[var(--ink-mute)] mt-1">
          Add your first service offering so your bot can pitch it to leads.
        </p>
      </div>
      <Button size="lg" onClick={onAdd}>
        Add service
      </Button>
    </div>
  );
}
