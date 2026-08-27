"use client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import { DataTable, type ColumnDef } from "@/shared/ui/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import {
  CalendarClock,
  CalendarOff,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  practitionerDisplayName,
  VISIBILITY_META,
  type Practitioner,
  type PractitionerVisibility,
} from "../types";
import { VISIBILITY_CHIP_CLASS } from "./PractitionerCard";

interface PractitionersListViewProps {
  practitioners: Practitioner[];
  isLoading: boolean;
  /** The clinic-wide default a practitioner inherits when it has no override. */
  workspaceVisibility: PractitionerVisibility;
  onEdit: (practitioner: Practitioner) => void;
  onManageTimeOff: (practitioner: Practitioner) => void;
  onDelete: (practitioner: Practitioner) => void;
  toolbar?: React.ReactNode;
}

export function PractitionersListView({
  practitioners,
  isLoading,
  workspaceVisibility,
  onEdit,
  onManageTimeOff,
  onDelete,
  toolbar,
}: PractitionersListViewProps) {
  const router = useRouter();

  const columns: ColumnDef<Practitioner, unknown>[] = useMemo(
    () => [
      {
        id: "fullName",
        accessorFn: (practitioner) => practitionerDisplayName(practitioner),
        header: "Practitioner",
        enableSorting: true,
        cell: ({ row }) => {
          const practitioner = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="size-8 shrink-0">
                {practitioner.photoUrl && (
                  <AvatarImage
                    src={practitioner.photoUrl}
                    alt={practitionerDisplayName(practitioner)}
                  />
                )}
                <AvatarFallback className="bg-[var(--accent-soft)] text-[11px] text-[var(--accent)]">
                  {practitioner.fullName.trim().charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[13px] font-medium text-[var(--ink)]">
                    {practitionerDisplayName(practitioner)}
                  </span>
                  {!practitioner.isActive && (
                    <span className="rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-1.5 py-px text-[10px] font-medium text-[var(--ink-mute)]">
                      Inactive
                    </span>
                  )}
                </div>
                {practitioner.designation && (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--ink-mute)]">
                    {practitioner.designation}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        id: "specialties",
        accessorFn: (practitioner) => practitioner.specialties.join(", "),
        header: "Specialties",
        enableSorting: false,
        cell: ({ row }) => {
          const { specialties } = row.original;
          if (specialties.length === 0) {
            return <span className="text-[var(--ink-mute)]">—</span>;
          }
          return (
            <span
              title={specialties.join(", ")}
              className="line-clamp-1 text-[12px] text-[var(--ink-soft)]"
            >
              {specialties.slice(0, 2).join(", ")}
              {specialties.length > 2 && ` +${specialties.length - 2}`}
            </span>
          );
        },
      },
      {
        id: "visibility",
        accessorFn: (practitioner) =>
          VISIBILITY_META[practitioner.visibility ?? workspaceVisibility].label,
        header: "Visibility",
        enableSorting: true,
        cell: ({ row }) => {
          const practitioner = row.original;
          const effective = practitioner.visibility ?? workspaceVisibility;
          return (
            <span
              title={
                practitioner.visibility === null
                  ? `Inherited — ${VISIBILITY_META[effective].description}`
                  : VISIBILITY_META[effective].description
              }
              className={cn(
                "whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
                VISIBILITY_CHIP_CLASS[effective],
              )}
            >
              {VISIBILITY_META[effective].label}
              {practitioner.visibility === null ? " · default" : ""}
            </span>
          );
        },
      },
      {
        id: "hours",
        accessorFn: (practitioner) =>
          practitioner.schedule?.availableDays.length ?? 0,
        header: "Hours",
        enableSorting: true,
        cell: ({ row }) => {
          const { schedule } = row.original;
          const hasOwnHours = Boolean(
            schedule && schedule.availableDays.length > 0,
          );
          return (
            <span className="whitespace-nowrap text-[12px] text-[var(--ink-soft)]">
              {hasOwnHours
                ? schedule!.availableDays.join(", ")
                : "Clinic-wide hours"}
            </span>
          );
        },
      },
      {
        id: "consultationFee",
        accessorFn: (practitioner) => practitioner.consultationFee ?? 0,
        header: "Fee",
        enableSorting: true,
        cell: ({ row }) => {
          const practitioner = row.original;
          if (practitioner.consultationFee == null) {
            return <span className="text-[var(--ink-mute)]">—</span>;
          }
          return (
            <span className="whitespace-nowrap text-[13px] font-medium text-[var(--ink)]">
              {practitioner.currency}{" "}
              {practitioner.consultationFee.toLocaleString()}
            </span>
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
                aria-label={`Actions for ${practitionerDisplayName(row.original)}`}
                onClick={(event) => event.stopPropagation()}
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil size={13} className="mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onManageTimeOff(row.original)}>
                <CalendarOff size={13} className="mr-2" /> Time off
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/bookings?practitionerId=${row.original.id}`)
                }
              >
                <CalendarClock size={13} className="mr-2" /> Appointments
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
    [workspaceVisibility, onEdit, onManageTimeOff, onDelete, router],
  );

  return (
    <DataTable
      data={practitioners}
      columns={columns}
      isLoading={isLoading}
      toolbar={toolbar}
      onRowClick={onEdit}
      emptyMessage="No practitioners found."
      defaultPageSize={10}
    />
  );
}
