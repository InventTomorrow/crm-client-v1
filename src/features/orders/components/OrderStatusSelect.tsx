import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { ORDER_STATUSES, type OrderStatus } from '../types';
import { ORDER_STATUS_META } from '../lib/format';

interface Props {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function OrderStatusSelect({ value, onChange, disabled, loading, className }: Props) {
  return (
    <div className="relative inline-flex items-center">
      <Select
        value={value}
        disabled={disabled || loading}
        onValueChange={(v) => onChange(v as OrderStatus)}
      >
        <SelectTrigger className={`h-8 min-w-[150px] text-[12.5px] ${className ?? ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s} className="text-[12.5px]">
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-[6px] h-[6px] rounded-full ${ORDER_STATUS_META[s].dot}`} />
                {ORDER_STATUS_META[s].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && (
        <Loader2 size={14} className="animate-spin text-[var(--accent)] ml-2 flex-shrink-0" />
      )}
    </div>
  );
}
