"use client";
import { Button } from "@/shared/ui/Button";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import {
  AlertTriangle,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo } from "react";
import {
  formatServicePrice,
  SERVICE_TYPE_LABELS,
  type ClinicalService,
} from "../types";

interface ClinicalServicesListViewProps {
  services: ClinicalService[];
  isLoading: boolean;
  onEdit: (service: ClinicalService) => void;
  onDelete: (service: ClinicalService) => void;
  toolbar?: React.ReactNode;
}

/** The same "how long, how often" line the card shows, flattened to one cell. */
function formatCommitment(service: ClinicalService): string {
  const parts: string[] = [];
  if (service.durationMinutes != null)
    parts.push(`${service.durationMinutes} min`);
  if (
    service.minServicePeriodDays != null &&
    service.minServicePeriodDays > 0
  ) {
    parts.push(`min ${service.minServicePeriodDays} days`);
  }
  if (service.shiftOptions.length > 0) {
    parts.push(
      `${service.shiftOptions.length} arrangement${service.shiftOptions.length === 1 ? "" : "s"}`,
    );
  }
  return parts.join(" · ");
}

export function ClinicalServicesListView({
  services,
  isLoading,
  onEdit,
  onDelete,
  toolbar,
}: ClinicalServicesListViewProps) {
  const columns: ColumnDef<ClinicalService, unknown>[] = useMemo(
    () => [
      {
        id: "name",
        accessorFn: (service) => service.name,
        header: "Service",
        enableSorting: true,
        cell: ({ row }) => {
          const service = row.original;
          return (
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[13px] font-medium text-[var(--ink)]">
                  {service.name}
                </span>
                {!service.isActive && (
                  <span className="rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-px text-[10px] font-medium text-[var(--ink-mute)]">
                    Inactive
                  </span>
                )}
                {!service.isPubliclyListed && (
                  <span
                    title="Not publicly listed"
                    className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] p-0.5 text-[var(--ink-mute)]"
                  >
                    <EyeOff size={10} />
                  </span>
                )}
                {service.safetyNote && (
                  <span
                    title={service.safetyNote}
                    className="inline-flex items-center rounded-full bg-[var(--warning-soft)] p-0.5 text-[var(--warning)]"
                  >
                    <AlertTriangle size={10} />
                  </span>
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
        id: "category",
        accessorFn: (service) => service.category ?? "",
        header: "Category",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.category ? (
            <span className="text-[12px] text-[var(--ink-soft)]">
              {row.original.category}
            </span>
          ) : (
            <span className="text-[var(--ink-mute)]">—</span>
          ),
      },
      {
        id: "serviceType",
        accessorFn: (service) => SERVICE_TYPE_LABELS[service.serviceType],
        header: "Type",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
            {SERVICE_TYPE_LABELS[row.original.serviceType]}
          </span>
        ),
      },
      {
        id: "price",
        accessorFn: (service) => service.price ?? service.priceMin ?? 0,
        header: "Price",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-[13px] font-medium text-[var(--ink)]">
            {formatServicePrice(row.original)}
          </span>
        ),
      },
      {
        id: "commitment",
        accessorFn: (service) => service.durationMinutes ?? 0,
        header: "Commitment",
        enableSorting: true,
        cell: ({ row }) => {
          const commitment = formatCommitment(row.original);
          return commitment ? (
            <span className="whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
              {commitment}
            </span>
          ) : (
            <span className="text-[var(--ink-mute)]">—</span>
          );
        },
      },
      {
        id: "__actions",
        size: 56,
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Actions for ${row.original.name}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil size={13} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(row.original)}
              >
                <Trash2 size={13} className="mr-2" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete],
  );

  return (
    <DataTable
      data={services}
      columns={columns}
      isLoading={isLoading}
      toolbar={toolbar}
      onRowClick={onEdit}
      emptyMessage="No services found."
      defaultPageSize={10}
    />
  );
}
