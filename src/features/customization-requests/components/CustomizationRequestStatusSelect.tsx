import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Loader2 } from 'lucide-react';
import { REQUEST_STATUS_META } from '../lib/format';
import {
  REVIEWABLE_STATUS_OPTIONS,
  type CustomizationRequestStatus,
  type ReviewableStatus,
} from '../types';

interface Props {
  value: CustomizationRequestStatus;
  onChange: (status: ReviewableStatus) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function CustomizationRequestStatusSelect({
  value,
  onChange,
  disabled,
  loading,
  className,
}: Props) {
  // CONVERTED is reached only by linking a real order, so it is not a choice
  // here — but a request already in it must still show what it is.
  const isReviewable = REVIEWABLE_STATUS_OPTIONS.includes(
    value as ReviewableStatus,
  );

  return (
    <div className="relative inline-flex items-center">
      <Select
        value={value}
        disabled={disabled || loading || !isReviewable}
        onValueChange={(next) => onChange(next as ReviewableStatus)}
      >
        <SelectTrigger
          className={`h-8 min-w-[150px] text-[12.5px] ${className ?? ''}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(isReviewable
            ? [...REVIEWABLE_STATUS_OPTIONS]
            : [value as ReviewableStatus]
          ).map((status) => (
            <SelectItem key={status} value={status} className="text-[12.5px]">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`w-[6px] h-[6px] rounded-full ${REQUEST_STATUS_META[status].dot}`}
                />
                {REQUEST_STATUS_META[status].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && (
        <Loader2
          size={14}
          className="animate-spin text-[var(--accent)] ml-2 flex-shrink-0"
        />
      )}
    </div>
  );
}
