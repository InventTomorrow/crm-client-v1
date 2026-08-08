'use client';
import { Clock } from 'lucide-react';
import type { PlanRequest, PlanRequestStatus } from '../types';

const STATUS_STYLES: Partial<Record<PlanRequestStatus, string>> = {
  PENDING_APPROVAL: 'text-info-foreground bg-info-soft',
  REJECTED: 'text-destructive-foreground bg-destructive-soft',
};

const STATUS_LABEL: Partial<Record<PlanRequestStatus, string>> = {
  PENDING_APPROVAL: 'Pending approval',
  REJECTED: 'Rejected',
};

function formatRequestDate(value: string) {
  return new Date(value).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface PlanRequestCardProps {
  request: PlanRequest;
}

/** The account's latest plan request with its review status. */
export function PlanRequestCard({ request }: PlanRequestCardProps) {
  return (
    <div className="card p-[22px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-semibold">Plan request — {request.plan.name}</h3>
            <span className={`badge font-medium ${STATUS_STYLES[request.status] ?? ''}`}>
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] text-[var(--ink-soft)]">
            <Clock size={13} />
            <span>
              Sent on {formatRequestDate(request.createdAt)} · {request.currency}{' '}
              {request.paymentAmount.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-[12.5px] text-[var(--ink-mute)]">
            {request.status === 'PENDING_APPROVAL'
              ? 'An admin is reviewing your payment receipt. Your plan activates once approved. Requesting another plan replaces this request.'
              : 'This request was not approved. You can pick a plan below to try again.'}
          </p>
        </div>
      </div>
    </div>
  );
}
