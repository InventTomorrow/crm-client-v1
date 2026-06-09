import { cn } from '@/lib/utils';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_META } from '../lib/format';

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const meta = ORDER_STATUS_META[status];
  return (
    <span className={cn('badge text-[11px] font-medium px-2.5 py-1 inline-flex items-center gap-1.5', meta.cls)}>
      <span className={cn('w-[6px] h-[6px] rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
