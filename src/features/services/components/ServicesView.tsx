"use client";
import { useAppStore } from "@/lib/appStore";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { SearchField } from "@/shared/ui/SearchField";
import { Spinner } from "@/shared/ui/Spinner";
import { Grid2x2, LayoutGrid, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  useDeleteServiceOffering,
  useServiceOfferings,
} from "../hooks/useServices";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import { ServiceCard } from "./ServiceCard";
import { ServicesEmptyState } from "./ServicesEmptyState";
import { ServicesTableView } from "./ServicesTableView";

const VIEW_BUTTONS = [
  { id: "grid", label: "Grid", Icon: LayoutGrid },
  { id: "table", label: "Table", Icon: Grid2x2 },
] as const;

export function ServicesView() {
  const router = useRouter();
  const { servicesView, setServicesView } = useAppStore();
  const [search, setSearch] = useState("");
  const [servicePendingDeletion, setServicePendingDeletion] = useState<
    string | null
  >(null);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isFetching,
  } = useServiceOfferings({ search: search || undefined });

  const deleteService = useDeleteServiceOffering();
  const allServices = data?.pages.flat() ?? [];

  const goToPreview = (serviceId: string) =>
    router.push(`/services/${serviceId}`);
  const goToEdit = (serviceId: string) =>
    router.push(`/services/${serviceId}/edit`);

  function handleDeleteConfirm() {
    if (!servicePendingDeletion) return;
    deleteService.mutate(servicePendingDeletion, {
      onSuccess: () => setServicePendingDeletion(null),
    });
  }

  const toolbar = (
    <div data-tour="page-actions" className="flex flex-wrap items-center gap-2">
      {/* <ServicesQuickNav services={allServices} /> */}

      <SearchField
        value={search}
        onValueChange={setSearch}
        placeholder="Search services…"
      />

      {/* View switch */}
      {/* p-0.5 around h-9 buttons lands the switch at h-10, level with the search field */}
      <div className="flex items-center gap-0.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] p-0.5 ml-auto">
        {VIEW_BUTTONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-label={`${label} view`}
            aria-pressed={servicesView === id}
            onClick={() => setServicesView(id)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              servicesView === id
                ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm"
                : "text-[var(--ink-mute)] hover:text-[var(--ink)]",
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      <RefreshButton
        onRefresh={() => refetch()}
        isRefreshing={isFetching}
        size="icon-lg"
      />

      {/* <Button variant="outline" size="xl" onClick={() => router.push('/services/plans')}>
        <LayoutList size={14} className="mr-1.5" /> Plans
      </Button> */}
      <Button size="xl" onClick={() => router.push("/services/new")}>
        <Plus size={14} className="mr-1.5" /> Add service
      </Button>
    </div>
  );

  // Server pages accumulate here; the table paginates what's loaded, this fetches more.
  const loadMore = hasNextPage && (
    <div className="flex justify-center pt-2">
      <Button
        variant="outline"
        size="lg"
        onClick={() => fetchNextPage()}
        disabled={isFetchingNextPage}
      >
        {isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );

  if (isError) {
    return (
      <div className="flex flex-col gap-5">
        {toolbar}
        <p className="py-12 text-center text-sm text-destructive">
          Failed to load services. Please refresh.
        </p>
      </div>
    );
  }

  if (servicesView === "table") {
    return (
      <div className="flex flex-col gap-3">
        <ServicesTableView
          services={allServices}
          isLoading={isLoading}
          onPreview={goToPreview}
          onEdit={goToEdit}
          onDelete={setServicePendingDeletion}
          toolbar={toolbar}
        />
        {loadMore}
        <ConfirmDialog
          open={!!servicePendingDeletion}
          onClose={() => setServicePendingDeletion(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete service?"
          description="This will remove the service offering and its RAG vector. The action cannot be undone."
          confirmLabel="Delete"
          destructive
          loading={deleteService.isPending}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {toolbar}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && allServices.length === 0 && (
        <ServicesEmptyState onAdd={() => router.push("/services/new")} />
      )}

      {allServices.length > 0 && (
        <>
          <div
            data-tour="page-list"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {allServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onPreview={goToPreview}
                onEdit={goToEdit}
                onDelete={setServicePendingDeletion}
              />
            ))}
          </div>
          {loadMore}
        </>
      )}

      <ConfirmDialog
        open={!!servicePendingDeletion}
        onClose={() => setServicePendingDeletion(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete service?"
        description="This will remove the service offering and its RAG vector. The action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteService.isPending}
      />
    </div>
  );
}
