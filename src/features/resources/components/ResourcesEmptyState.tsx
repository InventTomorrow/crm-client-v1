'use client';
import { Button } from '@/shared/ui/Button';
import { BriefcaseBusiness, FileText, FolderOpen, Receipt } from 'lucide-react';

const RESOURCE_EXAMPLES = [
  {
    id: 'brochure',
    label: 'Services brochure',
    description: 'The overview you send when a lead asks what you do.',
    Icon: FileText,
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    description: 'Past work, shared once a lead shows real interest.',
    Icon: BriefcaseBusiness,
  },
  {
    id: 'price-list',
    label: 'Price list',
    description: 'Sent only to leads whose budget clears your floor.',
    Icon: Receipt,
  },
];

export function ResourcesEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card flex flex-col items-center gap-6 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
        <FolderOpen size={22} />
      </span>

      <div className="max-w-[420px]">
        <h2 className="text-[15px] font-semibold text-[var(--ink)]">No resources yet</h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
          Upload the files you already send by hand. Add conditions and the bot only shares each
          one with the leads it suits.
        </p>
      </div>

      <div className="grid w-full max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-3">
        {RESOURCE_EXAMPLES.map(({ id, label, description, Icon }) => (
          <div
            key={id}
            className="flex flex-col gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3 text-left"
          >
            <span className="text-[var(--accent)]">
              <Icon size={14} />
            </span>
            <p className="text-[12.5px] font-medium text-[var(--ink)]">{label}</p>
            <p className="text-[11.5px] leading-relaxed text-[var(--ink-mute)]">{description}</p>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={onAdd}>
        Add your first resource
      </Button>
    </div>
  );
}
