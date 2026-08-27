"use client";
import { useBookingConfigQuery } from "@/features/bookings/hooks/useBookings";
import { Alert, AlertDescription } from "@/shared/ui/Alert";
import { Button } from "@/shared/ui/Button";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { RefreshButton } from "@/shared/ui/RefreshButton";
import { SearchField } from "@/shared/ui/SearchField";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import { Info, LayoutGrid, List, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDeletePractitioner,
  useInfinitePractitioners,
} from "../hooks/usePractitioners";
import {
  usePractitionersUiStore,
  type PractitionersView as PractitionersViewMode,
} from "../stores/practitionersUiStore";
import { VISIBILITY_META, type Practitioner } from "../types";
import { PractitionerCard } from "./PractitionerCard";
import { PractitionersEmptyState } from "./PractitionersEmptyState";
import { PractitionersListView } from "./PractitionersListView";
import { PractitionerTimeOffDialog } from "./PractitionerTimeOffDialog";

const SEARCH_DEBOUNCE_MS = 300;

const VIEW_BUTTONS = [
  { id: "grid", label: "Grid", Icon: LayoutGrid },
  { id: "list", label: "List", Icon: List },
] as const;

export function PractitionersView() {
  const router = useRouter();
  const { view, setView, searchTerm, setSearchTerm } = usePractitionersUiStore();
  // Seeded from the store so returning to the page with a search active does not
  // fire one unfiltered request before the debounce catches up.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(() =>
    searchTerm.trim(),
  );
  const [practitionerForTimeOff, setPractitionerForTimeOff] =
    useState<Practitioner | null>(null);
  const [practitionerPendingDeletion, setPractitionerPendingDeletion] =
    useState<Practitioner | null>(null);

  // Each keystroke would otherwise restart pagination from the first cursor.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearchTerm(searchTerm.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const practitionersQuery = useInfinitePractitioners(
    debouncedSearchTerm ? { search: debouncedSearchTerm } : {},
  );
  const bookingConfigQuery = useBookingConfigQuery();
  const deletePractitioner = useDeletePractitioner();

  const workspaceVisibility =
    bookingConfigQuery.data?.practitionerVisibility ?? "HIDDEN";
  const practitioners = practitionersQuery.data?.pages.flat() ?? [];

  // The form is its own route rather than a dialog: profile, expertise,
  // visibility and a full weekly schedule do not fit a modal.
  const openCreate = () => router.push("/practitioners/new");
  const openEdit = (practitioner: Practitioner) =>
    router.push(`/practitioners/${practitioner.id}/edit`);

  const header = (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-[var(--ink)]">
          Practitioners
        </h1>
        <p className="text-sm text-[var(--ink-mute)]">
          The doctors and therapists who see patients, and the hours they work.
        </p>
      </div>
      <Button size="xl" onClick={openCreate}>
        <Plus className="size-4" />
        Add practitioner
      </Button>
    </div>
  );

  // The clinic-wide setting caps every profile below it, so it belongs up top.
  const workspaceVisibilityNotice = (
    <Alert>
      <Info className="size-4" />
      <AlertDescription className="flex flex-wrap items-center gap-1">
        <span>
          Clinic-wide setting:{" "}
          <strong>{VISIBILITY_META[workspaceVisibility].label}</strong> —{" "}
          {VISIBILITY_META[workspaceVisibility].description}
        </span>
        <Link href="/bookings/availability" className="text-primary underline">
          Change it
        </Link>
      </AlertDescription>
    </Alert>
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <SearchField
        value={searchTerm}
        onValueChange={setSearchTerm}
        placeholder="Search by name, designation or profile"
        className="min-w-[240px]"
      />

      <div className="ml-auto flex items-center gap-2">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={view}
          onValueChange={(nextView) =>
            nextView && setView(nextView as PractitionersViewMode)
          }
        >
          {VIEW_BUTTONS.map(({ id, label, Icon }) => (
            <ToggleGroupItem key={id} value={id} aria-label={`${label} view`}>
              <Icon size={12} /> {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <RefreshButton
          onRefresh={() => practitionersQuery.refetch()}
          isRefreshing={practitionersQuery.isFetching}
          size="icon-lg"
        />
      </div>
    </div>
  );

  const loadMore = practitionersQuery.hasNextPage && (
    <div className="flex justify-center pt-1">
      <Button
        variant="outline"
        size="lg"
        onClick={() => practitionersQuery.fetchNextPage()}
        disabled={practitionersQuery.isFetchingNextPage}
      >
        {practitionersQuery.isFetchingNextPage ? "Loading…" : "Load more"}
      </Button>
    </div>
  );

  const dialogs = (
    <>
      <PractitionerTimeOffDialog
        open={practitionerForTimeOff !== null}
        onOpenChange={(open) => !open && setPractitionerForTimeOff(null)}
        practitioner={practitionerForTimeOff}
      />

      <ConfirmDialog
        open={practitionerPendingDeletion !== null}
        onClose={() => setPractitionerPendingDeletion(null)}
        title="Remove this practitioner?"
        description={
          practitionerPendingDeletion
            ? `${practitionerPendingDeletion.fullName} will stop being offered to patients. Existing appointments are kept.`
            : ""
        }
        confirmLabel="Remove"
        loading={deletePractitioner.isPending}
        onConfirm={() => {
          if (practitionerPendingDeletion) {
            deletePractitioner.mutate(practitionerPendingDeletion.id);
          }
          setPractitionerPendingDeletion(null);
        }}
      />
    </>
  );

  if (practitionersQuery.isError) {
    return (
      <div className="space-y-6">
        {header}
        {workspaceVisibilityNotice}
        {toolbar}
        <p className="py-12 text-center text-sm text-destructive">
          Failed to load practitioners. Please refresh.
        </p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <div className="space-y-4">
        {header}
        {workspaceVisibilityNotice}
        <PractitionersListView
          practitioners={practitioners}
          isLoading={practitionersQuery.isLoading}
          workspaceVisibility={workspaceVisibility}
          onEdit={openEdit}
          onManageTimeOff={setPractitionerForTimeOff}
          onDelete={setPractitionerPendingDeletion}
          toolbar={toolbar}
        />
        {loadMore}
        {dialogs}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      {workspaceVisibilityNotice}
      {toolbar}

      {practitionersQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-52 w-full rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      )}

      {!practitionersQuery.isLoading && practitioners.length === 0 && (
        <PractitionersEmptyState
          onAdd={openCreate}
          isFiltered={Boolean(debouncedSearchTerm)}
        />
      )}

      {practitioners.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {practitioners.map((practitioner) => (
              <PractitionerCard
                key={practitioner.id}
                practitioner={practitioner}
                workspaceVisibility={workspaceVisibility}
                onEdit={openEdit}
                onManageTimeOff={setPractitionerForTimeOff}
                onDelete={setPractitionerPendingDeletion}
              />
            ))}
          </div>
          {loadMore}
        </>
      )}

      {dialogs}
    </div>
  );
}
