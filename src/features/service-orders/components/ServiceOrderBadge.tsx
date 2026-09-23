import { cn } from '@/lib/utils';

export function ServiceOrderBadge({ meta }: { meta: { label: string; cls: string; dot: string } }) {
  return (
    <span className={cn('badge inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium', meta.cls)}>
      <span className={cn('h-[6px] w-[6px] rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
