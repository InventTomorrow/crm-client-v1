import { UtensilsCrossed } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function MenuEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-mute)]">
        <UtensilsCrossed size={22} />
      </div>
      <div>
        <p className="text-[13.5px] font-medium text-[var(--ink)]">No menu items yet</p>
        <p className="text-[12px] mt-0.5 text-[var(--ink-mute)]">Add your first dish to get started</p>
      </div>
      <Button size="sm" onClick={onAdd}>
        Add menu item
      </Button>
    </div>
  );
}
