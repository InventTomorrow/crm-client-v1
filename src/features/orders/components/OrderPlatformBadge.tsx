import { cn } from '@/lib/utils';
import type { OrderPlatform } from '../types';
import { ORDER_PLATFORM_META } from '../lib/format';

export function OrderPlatformBadge({
  platform,
  isSandbox,
}: {
  platform: OrderPlatform;
  isSandbox: boolean;
}) {
  const meta = ORDER_PLATFORM_META[platform];
  return (
    <span className="inline-flex max-w-full items-center gap-1.5">
      <span
        className={cn(
          'badge min-w-0 truncate whitespace-nowrap text-[11px] font-medium px-2.5 py-1',
          meta.cls,
        )}
        title={meta.label}
      >
        {meta.label}
      </span>
      {isSandbox && (
        <span className="badge shrink-0 whitespace-nowrap text-[11px] font-medium px-2.5 py-1 bg-[#FEF3C7] text-[#92400E]">
          Sandbox
        </span>
      )}
    </span>
  );
}
