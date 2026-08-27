"use client";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  formatServicePrice,
  SERVICE_TYPE_LABELS,
  type ClinicalService,
} from "../types";

interface ClinicalServiceCardProps {
  service: ClinicalService;
  onEdit: (service: ClinicalService) => void;
  onDelete: (service: ClinicalService) => void;
}

const MAX_EXCLUSION_CHIPS = 3;

/** The figures worth scanning, in the order an admin checks them. */
function buildMetaItems(service: ClinicalService): string[] {
  const items: string[] = [];

  if (service.durationMinutes != null) {
    items.push(`${service.durationMinutes} min`);
  }
  if (
    service.minServicePeriodDays != null &&
    service.minServicePeriodDays > 0
  ) {
    items.push(`min ${service.minServicePeriodDays} days`);
  }
  if (service.shiftOptions.length > 0) {
    items.push(
      `${service.shiftOptions.length} arrangement${
        service.shiftOptions.length === 1 ? "" : "s"
      }`,
    );
  }
  return items;
}

export function ClinicalServiceCard({
  service,
  onEdit,
  onDelete,
}: ClinicalServiceCardProps) {
  const metaItems = buildMetaItems(service);
  const hiddenExclusionCount =
    service.excludedActivities.length - MAX_EXCLUSION_CHIPS;

  return (
    <article
      className={cn(
        "group flex h-full flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)] transition-[border-color,box-shadow] hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-2)]",
        // A retired service stays readable but visibly recedes from the live ones.
        !service.isActive && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3
            className="truncate text-[15px] leading-tight font-semibold text-[var(--ink)]"
            title={service.name}
          >
            {service.name}
          </h3>
          {service.category && (
            <p className="truncate text-xs text-[var(--ink-mute)]">
              {service.category}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-[var(--accent-soft)] px-2 py-0.5 text-[11px] font-medium text-[var(--accent)]">
          {SERVICE_TYPE_LABELS[service.serviceType]}
        </span>
      </div>

      {(!service.isActive || !service.isPubliclyListed) && (
        <div className="flex flex-wrap gap-1.5">
          {!service.isActive && (
            <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-mute)]">
              Inactive
            </span>
          )}
          {!service.isPubliclyListed && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2 py-0.5 text-[11px] font-medium text-[var(--ink-mute)]">
              <EyeOff className="size-3" />
              Not listed
            </span>
          )}
        </div>
      )}

      <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">
        {service.shortDescription}
      </p>

      {/* Price leads its own band so it survives a fast scan down a column of cards. */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--r-10)] bg-[var(--surface-2)] px-3 py-2">
        <span className="text-[15px] font-semibold text-[var(--ink)]">
          {formatServicePrice(service)}
        </span>
        {metaItems.length > 0 && (
          <span className="flex items-center gap-1.5 text-xs text-[var(--ink-mute)]">
            <Clock className="size-3.5 shrink-0" />
            {metaItems.join(" · ")}
          </span>
        )}
      </div>

      {/* Surfaced on the card because getting it wrong is a safety problem, not
          a cosmetic one. */}
      {service.safetyNote && (
        <p className="flex items-start gap-1.5 rounded-[var(--r-10)] bg-[var(--warning-soft)] px-2.5 py-1.5 text-xs text-[var(--ink)]">
          <AlertTriangle className="mt-px size-3.5 shrink-0 text-[var(--warning)]" />
          <span className="line-clamp-2">{service.safetyNote}</span>
        </p>
      )}

      {service.excludedActivities.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--ink-mute)]">Excludes</span>
          {service.excludedActivities
            .slice(0, MAX_EXCLUSION_CHIPS)
            .map((activity) => (
              <span
                key={activity}
                title={activity}
                className="max-w-40 truncate rounded-full border border-[var(--line)] px-2 py-0.5 text-[11px] text-[var(--ink-soft)]"
              >
                {activity}
              </span>
            ))}
          {hiddenExclusionCount > 0 && (
            <span className="text-[11px] text-[var(--ink-mute)]">
              +{hiddenExclusionCount}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--line)] pt-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/clinical-services/${service.id}`}>
              <Eye className="size-3.5" />
              Preview
            </Link>
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(service)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Remove ${service.name}`}
          className="text-[var(--ink-mute)] hover:text-destructive"
          onClick={() => onDelete(service)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </article>
  );
}
