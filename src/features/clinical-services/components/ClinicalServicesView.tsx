"use client";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { NativeSelect } from "@/shared/ui/NativeSelect";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import { SearchField } from "@/shared/ui/SearchField";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { LayoutGrid, List, Plus, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDeleteClinicalService,
  useInfiniteClinicalServices,
} from "../hooks/useClinicalServices";
import {
  ALL_SERVICE_TYPES,
  useClinicalServicesUiStore,
  type ClinicalServiceTypeFilter,
  type ClinicalServicesView as ClinicalServicesViewMode,
} from "../stores/clinicalServicesUiStore";
import {
  CLINICAL_SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  type ClinicalService,
} from "../types";
import { ClinicalServiceCard } from "./ClinicalServiceCard";
import { ClinicalServicesListView } from "./ClinicalServicesListView";

const SEARCH_DEBOUNCE_MS = 300;

const VIEW_BUTTONS = [
  { id: "grid", label: "Grid", Icon: LayoutGrid },
  { id: "list", label: "List", Icon: List },
] as const;

export function ClinicalServicesView() {
  const router = useRouter();
  const { view, setView, searchTerm, setSearchTerm, typeFilter, setTypeFilter } =
    useClinicalServicesUiStore();
  // Seeded from the store so returning to the page with a search active does not
  // fire one unfiltered request before the debounce catches up.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(() =>
    searchTerm.trim(),
  );
  const [servicePendingDeletion, setServicePendingDeletion] =
    useState<ClinicalService | null>(null);

  // Each keystroke would otherwise restart pagination from the first cursor.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchTerm(searchTerm.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const servicesQuery = useInfiniteClinicalServices({
    ...(typeFilter === ALL_SERVICE_TYPES ? {} : { serviceType: typeFilter }),
    ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
  });
  const deleteService = useDeleteClinicalService();

  const services = servicesQuery.data?.pages.flat() ?? [];
  const isFiltered = Boolean(debouncedSearchTerm) || typeFilter !== ALL_SERVICE_TYPES;

  // The form is its own route rather than a dialog: it covers scope, pricing,
  // shift options, qualifications and safety, which is more than a modal can
  // hold without the admin scrolling blind.
  const openCreate = () => router.push("/clinical-services/new");
  const openEdit = (service: ClinicalService) =>
    router.push(`/clinical-services/${service.id}/edit`);

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={searchTerm}
        onValueChange={setSearchTerm}
        placeholder="Search by name, description or condition"
        className="min-w-[240px]"
      />
      <NativeSelect
        value={typeFilter}
        aria-label="Filter by type"
        onChange={(event) =>
          setTypeFilter(
            event.target.value as ClinicalServiceTypeFilter,
          )
        }
      >
        <option value={ALL_SERVICE_TYPES}>All types</option>
        {CLINICAL_SERVICE_TYPES.map((type) => (
          <option key={type} value={type}>
            {SERVICE_TYPE_LABELS[type]}
          </option>
        ))}
      </NativeSelect>

      <div className="ml-auto flex items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={view}
          onValueChange={(nextView) =>
            nextView && setView(nextView as ClinicalServicesViewMode)
          }
        >
          {VIEW_BUTTONS.map(({ id, label, Icon }) => (
            <ToggleGroupItem key={id} value={id} aria-label={`${label} view`}>
              <Icon size={12} /> {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <RefreshButton
          onRefresh={() => servicesQuery.refetch()}
          isRefreshing={servicesQuery.isFetching}
          size="icon-lg"
        />
      </div>
    </div>
  );

  const loadMore = servicesQuery.hasNextPage && (
    <div className="flex justify-center pt-1">
      <Button
        variant="outline"
        size="lg"
        onClick={() => servicesQuery.fetchNextPage()}
        disabled={servicesQuery.isFetchingNextPage}
      >
        {servicesQuery.isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );

  const header = (
    <div
      data-tour="page-actions"
      className="flex flex-wrap items-start justify-between gap-3"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">Services</h1>
        <p className="text-sm text-[var(--ink-mute)]">
          What the clinic offers, what each service covers, and what it costs.
        </p>
      </div>
      <Button size="xl" onClick={openCreate}>
        <Plus className="size-4" />
        Add service
      </Button>
    </div>
  );

  const deleteDialog = (
    <ConfirmDialog
      open={servicePendingDeletion !== null}
      onClose={() => setServicePendingDeletion(null)}
      title="Remove this service?"
      description={
        servicePendingDeletion
          ? `${servicePendingDeletion.name} will stop being offered, and its coverage rows will no longer apply.`
          : ""
      }
      confirmLabel="Remove"
      loading={deleteService.isPending}
      onConfirm={() => {
        if (servicePendingDeletion)
          deleteService.mutate(servicePendingDeletion.id);
        setServicePendingDeletion(null);
      }}
    />
  );

  if (servicesQuery.isError) {
    return (
      <div className="space-y-6">
        {header}
        {toolbar}
        <p className="py-12 text-center text-sm text-destructive">
          Failed to load services. Please refresh.
        </p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {header}
        <ClinicalServicesListView
          services={services}
          isLoading={servicesQuery.isLoading}
          onEdit={openEdit}
          onDelete={setServicePendingDeletion}
          toolbar={toolbar}
        />
        {loadMore}
        {deleteDialog}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      {toolbar}

      {servicesQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-56 w-full rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      )}

      {!servicesQuery.isLoading && services.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface)] py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
            <Stethoscope className="size-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--ink)]">
              {isFiltered
                ? "No services match those filters"
                : "No services yet"}
            </p>
            <p className="mx-auto max-w-sm text-sm text-[var(--ink-mute)]">
              {isFiltered
                ? "Try a different search or type."
                : "Add the care this clinic provides. The assistant answers scope and pricing questions only from what you enter here."}
            </p>
          </div>
          {!isFiltered && (
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Add service
            </Button>
          )}
        </div>
      )}

      {services.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ClinicalServiceCard
                key={service.id}
                service={service}
                onEdit={openEdit}
                onDelete={setServicePendingDeletion}
              />
            ))}
          </div>
          {loadMore}
        </>
      )}

      {deleteDialog}
    </div>
  );
}
