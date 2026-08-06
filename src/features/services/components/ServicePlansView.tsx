'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { DataTable, type ColumnDef } from '@/shared/ui/DataTable';
import { ArrowLeft, Pencil, Plus, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useServiceOfferings } from '../hooks/useServices';
import {
  BILLING_CYCLE_LABELS,
  type ServiceOffering,
  type ServicePlan,
} from '../types';

/** One table row — a plan flattened together with the service it belongs to, since the plan
 * alone carries neither the service name nor the currency its price is in. */
interface ServicePlanRow {
  rowId: string;
  serviceId: string;
  serviceName: string;
  isServiceActive: boolean;
  currency: string;
  plan: ServicePlan;
}

function toPlanRows(services: ServiceOffering[]): ServicePlanRow[] {
  return services.flatMap((service) =>
    service.plans.map((plan) => ({
      rowId: `${service.id}-${plan.key}`,
      serviceId: service.id,
      serviceName: service.name,
      isServiceActive: service.isActive,
      currency: service.currency,
      plan,
    })),
  );
}

export function ServicePlansView() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useServiceOfferings({});

  const allServices = useMemo(() => data?.pages.flat() ?? [], [data]);
  const planRows = useMemo(() => toPlanRows(allServices), [allServices]);
  const servicesWithPlans = new Set(planRows.map((row) => row.serviceId)).size;

  const columns: ColumnDef<ServicePlanRow, unknown>[] = useMemo(
    () => [
      {
        id: 'serviceName',
        accessorFn: (row) => row.serviceName,
        header: 'Service',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-medium text-[var(--ink)]">
              {row.original.serviceName}
            </span>
            {!row.original.isServiceActive && (
              <Badge variant="secondary" className="text-[10px]">
                Inactive
              </Badge>
            )}
          </div>
        ),
      },
      {
        id: 'planName',
        accessorFn: (row) => row.plan.name,
        header: 'Plan',
        enableSorting: true,
        cell: ({ row }) => {
          const { plan } = row.original;
          return (
            <div className="min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] text-[var(--ink)]">
                {plan.name || <em className="text-[var(--ink-mute)]">Untitled</em>}
                {plan.isHighlighted && (
                  <Star size={10} className="text-[var(--accent)]" fill="currentColor" />
                )}
              </span>
              {plan.bestFor && (
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--ink-mute)]">
                  {plan.bestFor}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: 'price',
        // Custom quotes sort below every real price rather than alongside zero-priced plans.
        accessorFn: (row) => row.plan.price ?? -1,
        header: 'Price',
        enableSorting: true,
        cell: ({ row }) => {
          const { plan, currency } = row.original;
          if (plan.price == null) {
            return <span className="text-[var(--ink-mute)]">Custom quote</span>;
          }
          return (
            <span className="whitespace-nowrap text-[13px] font-medium text-[var(--ink)]">
              {currency} {plan.price.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: 'billingCycle',
        accessorFn: (row) => BILLING_CYCLE_LABELS[row.plan.billingCycle],
        header: 'Billing',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
            {BILLING_CYCLE_LABELS[row.original.plan.billingCycle]}
          </span>
        ),
      },
      {
        id: 'minContractMonths',
        accessorFn: (row) => row.plan.minContractMonths,
        header: 'Min. months',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-[12px] text-[var(--ink-soft)]">
            {row.original.plan.minContractMonths || '—'}
          </span>
        ),
      },
      {
        id: 'features',
        accessorFn: (row) => row.plan.features.length,
        header: 'Features',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-[12px] text-[var(--ink-soft)]">
            {row.original.plan.features.length}
          </span>
        ),
      },
      {
        id: '__actions',
        size: 56,
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${row.original.serviceName}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/services/${row.original.serviceId}/edit`);
            }}
          >
            <Pencil size={13} />
          </Button>
        ),
      },
    ],
    [router],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to services"
            onClick={() => router.push('/services')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--ink)]">Plans &amp; pricing</h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              {planRows.length > 0
                ? `${planRows.length} plan${planRows.length > 1 ? 's' : ''} across ${servicesWithPlans} service${servicesWithPlans > 1 ? 's' : ''}`
                : 'Every tier across your services'}
            </p>
          </div>
        </div>

        <Button size="lg" onClick={() => router.push('/services/new')}>
          <Plus size={14} className="mr-1.5" /> Add service
        </Button>
      </div>

      {isError ? (
        <p className="py-12 text-center text-sm text-destructive">
          Failed to load plans. Please refresh.
        </p>
      ) : (
        <>
          <DataTable
            data={planRows}
            columns={columns}
            isLoading={isLoading}
            onRowClick={(row) => router.push(`/services/${row.serviceId}`)}
            emptyMessage="No plans yet — plans are added inside a service."
            defaultPageSize={20}
          />

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading…' : 'Load more services'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
