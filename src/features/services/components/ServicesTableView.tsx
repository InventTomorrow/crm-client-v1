'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, type ColumnDef } from '@/shared/ui/DataTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { Eye, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import {
  DELIVERY_TYPE_LABELS,
  PRICING_TYPE_LABELS,
  type ServiceOffering,
} from '../types';

interface ServicesTableViewProps {
  services: ServiceOffering[];
  isLoading: boolean;
  onPreview: (serviceId: string) => void;
  onEdit: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  toolbar?: React.ReactNode;
}

export function ServicesTableView({
  services,
  isLoading,
  onPreview,
  onEdit,
  onDelete,
  toolbar,
}: ServicesTableViewProps) {
  const columns: ColumnDef<ServiceOffering, unknown>[] = useMemo(
    () => [
      {
        id: 'name',
        accessorFn: (service) => service.name,
        header: 'Service',
        enableSorting: true,
        cell: ({ row }) => {
          const service = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-medium text-[var(--ink)]">
                  {service.name}
                </span>
                {!service.isActive && (
                  <Badge variant="secondary" className="text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--ink-mute)]">
                {service.shortDescription}
              </p>
            </div>
          );
        },
      },
      {
        id: 'category',
        accessorFn: (service) => service.category ?? '',
        header: 'Category',
        enableSorting: true,
        cell: ({ row }) =>
          row.original.category ? (
            <Badge variant="secondary" className="text-[10px]">
              {row.original.category}
            </Badge>
          ) : (
            <span className="text-[var(--ink-mute)]">—</span>
          ),
      },
      {
        id: 'deliveryType',
        accessorFn: (service) => DELIVERY_TYPE_LABELS[service.deliveryType],
        header: 'Delivery',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
            {DELIVERY_TYPE_LABELS[row.original.deliveryType]}
          </span>
        ),
      },
      {
        id: 'pricingType',
        accessorFn: (service) => PRICING_TYPE_LABELS[service.pricingType],
        header: 'Pricing',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
            {PRICING_TYPE_LABELS[row.original.pricingType]}
          </span>
        ),
      },
      {
        id: 'startingPrice',
        accessorFn: (service) => service.startingPrice ?? 0,
        header: 'From',
        enableSorting: true,
        cell: ({ row }) => {
          const service = row.original;
          if (service.startingPrice == null) {
            return <span className="text-[var(--ink-mute)]">On request</span>;
          }
          return (
            <span className="whitespace-nowrap text-[13px] font-medium text-[var(--ink)]">
              {service.currency} {service.startingPrice.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'plans',
        accessorFn: (service) => service.plans.length,
        header: 'Plans',
        enableSorting: true,
        cell: ({ row }) => {
          const { plans } = row.original;
          if (plans.length === 0) {
            return <span className="text-[var(--ink-mute)]">—</span>;
          }
          const hasHighlighted = plans.some((plan) => plan.isHighlighted);
          return (
            <span className="flex items-center gap-1 whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
              {plans.length}
              {hasHighlighted && (
                <Star size={10} className="text-[var(--accent)]" fill="currentColor" />
              )}
            </span>
          );
        },
      },
      {
        id: '__actions',
        size: 56,
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onPreview(row.original.id)}>
                <Eye size={13} className="mr-2" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                <Pencil size={13} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 size={13} className="mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onPreview, onEdit, onDelete],
  );

  return (
    <DataTable
      data={services}
      columns={columns}
      isLoading={isLoading}
      toolbar={toolbar}
      onRowClick={(service) => onPreview(service.id)}
      emptyMessage="No services found."
      defaultPageSize={20}
    />
  );
}
