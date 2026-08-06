'use client';
import { CheckCircle2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import type { ServiceOffering } from '../types';
import { DELIVERY_TYPE_LABELS, PRICING_TYPE_LABELS } from '../types';

interface ServiceCardProps {
  service: ServiceOffering;
  onPreview: (serviceId: string) => void;
  onEdit: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
}

export function ServiceCard({ service, onPreview, onEdit, onDelete }: ServiceCardProps) {
  return (
    // The card body opens the read-only preview; editing and deleting stay in the menu so a
    // stray click can never drop you into a form.
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPreview(service.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPreview(service.id);
        }
      }}
      className="h-full rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 flex flex-col gap-3 cursor-pointer hover:border-[var(--accent)]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg)]"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--ink)] text-sm leading-snug truncate">
              {service.name}
            </h3>
            {!service.isActive && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Inactive
              </Badge>
            )}
          </div>
          <p className="text-xs text-[var(--ink-mute)] mt-0.5 line-clamp-2">
            {service.shortDescription}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Actions for ${service.name}`}
              className="shrink-0 -mt-0.5"
              onClick={(event) => event.stopPropagation()}
            >
              <MoreVertical size={15} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(service.id)}>
              <Pencil size={13} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(service.id)}
            >
              <Trash2 size={13} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px]">
          {DELIVERY_TYPE_LABELS[service.deliveryType]}
        </Badge>
        <Badge variant="outline" className="text-[10px]">
          {PRICING_TYPE_LABELS[service.pricingType]}
        </Badge>
        {service.category && (
          <Badge variant="secondary" className="text-[10px]">
            {service.category}
          </Badge>
        )}
      </div>

      {/* Starting price */}
      {service.startingPrice != null && (
        <p className="text-sm font-semibold text-[var(--ink)]">
          From {service.currency} {service.startingPrice.toLocaleString()}
          <span className="text-[var(--ink-mute)] font-normal text-xs"> / mo</span>
        </p>
      )}

      {/* Key outcomes */}
      {service.keyOutcomes.length > 0 && (
        <ul className="flex flex-col gap-1">
          {service.keyOutcomes.slice(0, 3).map((outcome) => (
            <li key={outcome} className="flex items-start gap-1.5 text-xs text-[var(--ink-soft)]">
              <CheckCircle2 size={11} className="text-[var(--accent)] mt-0.5 shrink-0" />
              {outcome}
            </li>
          ))}
          {service.keyOutcomes.length > 3 && (
            <li className="text-xs text-[var(--ink-mute)] pl-[19px]">
              +{service.keyOutcomes.length - 3} more
            </li>
          )}
        </ul>
      )}

      {/* Plans count — pinned to the bottom so footers line up across a row of cards */}
      {service.plans.length > 0 && (
        <p className="text-xs text-[var(--ink-mute)] border-t border-[var(--line)] pt-2 mt-auto">
          {service.plans.length} plan{service.plans.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
