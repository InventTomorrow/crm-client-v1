'use client';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { SearchField } from '@/shared/ui/SearchField';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import { FileText, FolderOpen, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDeleteResource, useResourcesQuery } from '../hooks/useResources';
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  type ResourceType,
  type TenantResource,
} from '../types';
import { isUnconditional } from '../utils/resourceFormat';
import { ResourceCard } from './ResourceCard';
import { ResourceFormDialog } from './ResourceFormDialog';
import { ResourcesEmptyState } from './ResourcesEmptyState';

const ALL_TYPES = 'ALL';

export function ResourcesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | typeof ALL_TYPES>(ALL_TYPES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resourceBeingEdited, setResourceBeingEdited] = useState<TenantResource | null>(null);
  const [resourcePendingDeletion, setResourcePendingDeletion] =
    useState<TenantResource | null>(null);

  const resourcesQuery = useResourcesQuery({
    ...(typeFilter === ALL_TYPES ? {} : { resourceType: typeFilter }),
    ...(searchTerm.trim() ? { search: searchTerm.trim() } : {}),
  });

  const deleteResource = useDeleteResource();

  const resources = useMemo(
    () => resourcesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [resourcesQuery.data],
  );

  const activeCount = resources.filter((resource) => resource.isActive).length;
  const targetedCount = resources.filter((resource) => !isUnconditional(resource)).length;

  const openCreateDialog = () => {
    setResourceBeingEdited(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (resource: TenantResource) => {
    setResourceBeingEdited(resource);
    setIsFormOpen(true);
  };

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[18px] font-semibold text-[var(--ink)]">Resources</h1>
        <p className="text-[12px] text-[var(--ink-mute)]">
          Brochures, portfolios and case studies the bot shares with leads.
        </p>
      </div>

      <Button size="lg" onClick={openCreateDialog}>
        <Plus size={14} className="mr-1.5" /> Add resource
      </Button>
    </div>
  );

  const hasFilters = searchTerm.trim().length > 0 || typeFilter !== ALL_TYPES;
  const isEmpty = !resourcesQuery.isLoading && resources.length === 0;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      {header}

      {isEmpty && !hasFilters ? (
        <ResourcesEmptyState onAdd={openCreateDialog} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <StatCard label="Resources" value={resources.length} Icon={FolderOpen} />
            <StatCard
              label="Shared by the bot"
              value={activeCount}
              hint={activeCount === 0 ? 'Nothing is being shared' : undefined}
              Icon={FileText}
            />
            <StatCard
              label="Targeted"
              value={targetedCount}
              hint={`${resources.length - targetedCount} go to everyone`}
              Icon={Users}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Search resources…"
            />

            <Select
              value={typeFilter}
              onValueChange={(nextType) =>
                setTypeFilter(nextType as ResourceType | typeof ALL_TYPES)
              }
            >
              <SelectTrigger size="lg" className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES}>All types</SelectItem>
                {RESOURCE_TYPES.map((resourceType) => (
                  <SelectItem key={resourceType} value={resourceType}>
                    {RESOURCE_TYPE_LABELS[resourceType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {resourcesQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : resources.length === 0 ? (
            <p className="card px-6 py-12 text-center text-[12.5px] text-[var(--ink-mute)]">
              No resources match those filters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {resources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onEdit={openEditDialog}
                  onDelete={setResourcePendingDeletion}
                />
              ))}
            </div>
          )}

          {resourcesQuery.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => resourcesQuery.fetchNextPage()}
                disabled={resourcesQuery.isFetchingNextPage}
              >
                {resourcesQuery.isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}

      <ResourceFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editing={resourceBeingEdited}
      />

      <ConfirmDialog
        open={resourcePendingDeletion !== null}
        onClose={() => setResourcePendingDeletion(null)}
        loading={deleteResource.isPending}
        title="Delete this resource?"
        description={
          resourcePendingDeletion
            ? `"${resourcePendingDeletion.label}" and its file will be removed. The bot will stop sharing it.`
            : undefined
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (!resourcePendingDeletion) return;
          deleteResource.mutate(resourcePendingDeletion.id, {
            onSuccess: () => setResourcePendingDeletion(null),
          });
        }}
      />
    </div>
  );
}
