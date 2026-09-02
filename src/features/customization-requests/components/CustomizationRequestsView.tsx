'use client';
import { useUrlState } from '@/shared/hooks/useUrlState';
import { Button } from '@/shared/ui/Button';
import { DataTable, type ColumnDef } from '@/shared/ui/DataTable';
import { Input } from '@/shared/ui/Input';
import { RefreshButton } from '@/shared/ui/RefreshButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { StatCard } from '@/shared/ui/StatCard';
import { Loader2, Search } from 'lucide-react';
import { useMemo } from 'react';
import {
  useCustomizationRequests,
  useCustomizationRequestsSummary,
  useRefreshCustomizationRequests,
} from '../hooks/useCustomizationRequests';
import {
  REQUEST_REASON_META,
  REQUEST_STATUS_META,
  formatWaitingFor,
} from '../lib/format';
import {
  CUSTOMIZATION_REQUEST_STATUSES,
  type CustomizationRequest,
  type CustomizationRequestFilters,
  type CustomizationRequestStatus,
} from '../types';
import { CustomizationRequestDetailSheet } from './CustomizationRequestDetailSheet';
import { CustomizationRequestStatusBadge } from './CustomizationRequestStatusBadge';

/** Counts worth pinning to the top of the queue, in the order they are worked. */
const HIGHLIGHTED_STATUSES: CustomizationRequestStatus[] = [
  'NEW',
  'IN_REVIEW',
  'ANSWERED',
  'ACCEPTED',
];

export function CustomizationRequestsView() {
  const [search, setSearch] = useUrlState('rq');
  const [statusParam, setStatus] = useUrlState('rstatus');
  const [selectedId, setSelectedId] = useUrlState('request');
  const status = statusParam as CustomizationRequestStatus | '';

  const filters: CustomizationRequestFilters = useMemo(
    () => ({
      ...(search ? { search } : {}),
      // No explicit status means "everything still needing a person" — a queue
      // that shows closed requests by default is a queue nobody trusts.
      ...(status ? { status } : { openOnly: true }),
    }),
    [search, status],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCustomizationRequests(filters);
  const { data: summary } = useCustomizationRequestsSummary();
  const { refreshRequests, isRefreshing } = useRefreshCustomizationRequests();

  const requests = useMemo(() => data?.pages.flat() ?? [], [data]);

  const countFor = (target: CustomizationRequestStatus) =>
    summary?.byStatus.find((row) => row.status === target)?.count ?? 0;

  const columns: ColumnDef<CustomizationRequest, unknown>[] = useMemo(
    () => [
      {
        id: 'customer',
        accessorFn: (request) => request.lead?.name ?? '',
        header: 'Customer',
        enableSorting: true,
        size: 170,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="text-[13px] text-[var(--ink)] truncate font-medium">
              {row.original.lead?.name || 'Unknown'}
            </div>
            {row.original.lead?.phone && (
              <div className="text-[11.5px] text-[var(--ink-mute)]">
                {row.original.lead.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'product',
        accessorFn: (request) => request.productName,
        header: 'Product',
        enableSorting: true,
        size: 170,
        cell: ({ row }) => (
          <div className="min-w-0">
            <div className="text-[13px] text-[var(--ink)] truncate">
              {row.original.productName}
            </div>
            {row.original.variantLabel && (
              <div className="text-[11.5px] text-[var(--ink-mute)] truncate">
                {row.original.variantLabel}
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'customerNote',
        accessorFn: (request) => request.customerNote,
        header: 'What they asked for',
        enableSorting: false,
        cell: ({ row }) => (
          <span
            title={row.original.customerNote}
            className="text-[12.5px] text-[var(--ink-soft)] line-clamp-2"
          >
            {row.original.customerNote}
          </span>
        ),
      },
      {
        id: 'reason',
        accessorFn: (request) => request.reason,
        header: 'Why',
        enableSorting: true,
        size: 150,
        cell: ({ row }) => (
          <span
            title={REQUEST_REASON_META[row.original.reason].description}
            className="text-[12px] text-[var(--ink-mute)]"
          >
            {REQUEST_REASON_META[row.original.reason].label}
          </span>
        ),
      },
      {
        id: 'status',
        accessorFn: (request) => request.status,
        header: 'Status',
        enableSorting: true,
        size: 130,
        cell: ({ row }) => (
          <CustomizationRequestStatusBadge status={row.original.status} />
        ),
      },
      {
        id: 'createdAt',
        accessorFn: (request) => new Date(request.createdAt).getTime(),
        header: 'Waiting',
        enableSorting: true,
        size: 110,
        cell: ({ row }) => (
          <span className="text-[12px] text-[var(--ink-mute)]">
            {formatWaitingFor(row.original.createdAt)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-3 mb-5">
        <p className="text-[13px] text-[var(--ink-mute)] max-w-[62ch]">
          Customizations the assistant could not confirm on its own. These are
          not orders — nothing is priced or reserved until someone here answers
          the customer in their chat.
        </p>
        <RefreshButton
          onRefresh={refreshRequests}
          isRefreshing={isRefreshing}
          label="Refresh requests"
        />
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
          <StatCard
            label="Needs follow-up"
            value={summary.open}
            hint={`${summary.total} request${summary.total === 1 ? '' : 's'} all time`}
          />
          {HIGHLIGHTED_STATUSES.map((highlighted) => (
            <StatCard
              key={highlighted}
              label={REQUEST_STATUS_META[highlighted].label}
              value={countFor(highlighted)}
              active={status === highlighted}
              onClick={() => setStatus(status === highlighted ? '' : highlighted)}
            />
          ))}
        </div>
      )}

      <DataTable
        data={requests as CustomizationRequest[]}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(request) => setSelectedId(request.id)}
        emptyMessage="No customization requests waiting. Anything the assistant can't confirm on its own lands here."
        defaultPageSize={20}
        maxBodyHeight="60vh"
        toolbar={
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            <div className="relative flex-1 min-w-45 max-w-85">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-mute)] pointer-events-none"
              />
              <Input
                className="pl-8 text-[13px]"
                placeholder="Search by customer, product, or request…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Select
              value={status || '__open__'}
              onValueChange={(next) =>
                setStatus(
                  next === '__open__'
                    ? ''
                    : (next as CustomizationRequestStatus),
                )
              }
            >
              <SelectTrigger className="w-[170px] text-[13px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__open__">Needs follow-up</SelectItem>
                {CUSTOMIZATION_REQUEST_STATUSES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {REQUEST_STATUS_META[option].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {hasNextPage && (
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && (
              <Loader2 size={13} className="animate-spin" />
            )}
            Load more
          </Button>
        </div>
      )}

      {selectedId && (
        <CustomizationRequestDetailSheet
          requestId={selectedId}
          onClose={() => setSelectedId('')}
        />
      )}
    </div>
  );
}
