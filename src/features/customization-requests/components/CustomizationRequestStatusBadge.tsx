import { cn } from '@/lib/utils';
import { REQUEST_STATUS_META } from '../lib/format';
import type { CustomizationRequestStatus } from '../types';

export function CustomizationRequestStatusBadge({
  status,
}: {
  status: CustomizationRequestStatus;
}) {
  const meta = REQUEST_STATUS_META[status];
  return (
    <span
      title={meta.hint}
      className={cn(
        'badge text-[11px] font-medium px-2.5 py-1 inline-flex items-center gap-1.5',
        meta.cls,
      )}
    >
      <span className={cn('w-[6px] h-[6px] rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}
