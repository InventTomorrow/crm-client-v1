import { ORDER_STATUSES, type OrderStatus } from '../types';
import { ORDER_STATUS_META } from '../lib/format';

interface Props {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function OrderStatusSelect({ value, onChange, disabled, className }: Props) {
  return (
    <select
      className={`input text-[12.5px] py-1.5 ${className ?? ''}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {ORDER_STATUS_META[s].label}
        </option>
      ))}
    </select>
  );
}
