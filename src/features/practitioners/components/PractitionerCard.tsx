"use client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/Avatar";
import { Button } from "@/shared/ui/Button";
import {
  CalendarClock,
  CalendarOff,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  practitionerDisplayName,
  VISIBILITY_META,
  type Practitioner,
  type PractitionerVisibility,
} from "../types";

interface PractitionerCardProps {
  practitioner: Practitioner;
  /** The clinic-wide default this practitioner inherits when it has no override. */
  workspaceVisibility: PractitionerVisibility;
  onEdit: (practitioner: Practitioner) => void;
  onManageTimeOff: (practitioner: Practitioner) => void;
  onDelete: (practitioner: Practitioner) => void;
}

/** Bookable is the one state worth colouring — the rest read as degrees of quiet. */
export const VISIBILITY_CHIP_CLASS: Record<PractitionerVisibility, string> = {
  BOOKABLE: "bg-[var(--accent-soft)] text-[var(--accent)]",
  LISTED:
    "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-soft)]",
  HIDDEN:
    "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink-mute)]",
};

const MAX_SPECIALTY_CHIPS = 4;

export function PractitionerCard({
  practitioner,
  workspaceVisibility,
  onEdit,
  onManageTimeOff,
  onDelete,
}: PractitionerCardProps) {
  // What actually applies — the override may only narrow, so the effective
  // level is whichever of the two is more restrictive.
  const effective = practitioner.visibility ?? workspaceVisibility;
  const isInherited = practitioner.visibility === null;
  const schedule = practitioner.schedule;
  const hasOwnHours = Boolean(schedule && schedule.availableDays.length > 0);
  const hiddenSpecialtyCount =
    practitioner.specialties.length - MAX_SPECIALTY_CHIPS;

  return (
    <article
      className={cn(
        "flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)] transition-[border-color,box-shadow] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-2)]",
        // A retired profile stays readable but visibly recedes from the live ones.
        !practitioner.isActive && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        {/* The photo the assistant sends with this profile, so an upload is
            visible here rather than only inside the form. */}
        <Avatar className="size-11 shrink-0">
          {practitioner.photoUrl && (
            <AvatarImage
              src={practitioner.photoUrl}
              alt={practitionerDisplayName(practitioner)}
            />
          )}
          <AvatarFallback className="bg-[var(--accent-soft)] text-[var(--accent)]">
            {practitioner.fullName.trim().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/practitioners/${practitioner.id}/edit`}
              className="truncate text-[15px] leading-tight font-semibold text-[var(--ink)] hover:underline"
            >
              {practitionerDisplayName(practitioner)}
            </Link>
            {!practitioner.isActive && (
              <span className="rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-mute)]">
                Inactive
              </span>
            )}
          </div>
          {practitioner.designation && (
            <p className="truncate text-xs text-[var(--ink-mute)]">
              {practitioner.designation}
            </p>
          )}
        </div>

        <span
          title={VISIBILITY_META[effective].description}
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
            VISIBILITY_CHIP_CLASS[effective],
          )}
        >
          {VISIBILITY_META[effective].label}
          {isInherited ? " · clinic default" : ""}
        </span>
      </div>

      {practitioner.specialties.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {practitioner.specialties
            .slice(0, MAX_SPECIALTY_CHIPS)
            .map((specialty) => (
              <span
                key={specialty}
                className="max-w-40 truncate rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]"
              >
                {specialty}
              </span>
            ))}
          {hiddenSpecialtyCount > 0 && (
            <span className="text-[11px] text-[var(--ink-mute)]">
              +{hiddenSpecialtyCount}
            </span>
          )}
        </div>
      )}

      {/* Hours and fee share one band, the same way the service card leads with price. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--r-10)] bg-[var(--surface-2)] px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
          <Clock className="size-3.5 shrink-0 text-[var(--ink-mute)]" />
          {hasOwnHours
            ? `Own hours · ${schedule!.availableDays.join(", ")}`
            : "Uses the clinic-wide hours"}
        </span>
        {practitioner.consultationFee != null && (
          <span className="text-[13px] font-semibold text-[var(--ink)]">
            {practitioner.currency}{" "}
            {practitioner.consultationFee.toLocaleString()}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-3">
        <Button size="sm" variant="outline" onClick={() => onEdit(practitioner)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onManageTimeOff(practitioner)}
        >
          <CalendarOff className="size-3.5" />
          Time off
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/bookings?practitionerId=${practitioner.id}`}>
            <CalendarClock className="size-3.5" />
            Appointments
          </Link>
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Remove ${practitionerDisplayName(practitioner)}`}
          className="ml-auto text-[var(--ink-mute)] hover:text-destructive"
          onClick={() => onDelete(practitioner)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}
