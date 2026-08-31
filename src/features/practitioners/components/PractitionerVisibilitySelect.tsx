'use client';
import { Label } from '@/shared/ui/Label';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import Link from 'next/link';
import {
  isVisibilityAllowed,
  PRACTITIONER_VISIBILITIES,
  VISIBILITY_META,
  type PractitionerVisibility,
} from '../types';

interface PractitionerVisibilitySelectProps {
  /** null means "inherit the clinic default" — only reachable in override mode. */
  value: PractitionerVisibility | null;
  onChange: (visibility: PractitionerVisibility | null) => void;
  /**
   * The clinic-wide ceiling, which puts this control in OVERRIDE mode: an
   * "inherit" row appears and anything wider than the ceiling is locked.
   *
   * Omit it to edit the ceiling ITSELF — no inherit row, nothing locked.
   */
  workspaceDefault?: PractitionerVisibility;
  disabled?: boolean;
  label?: string;
}

/**
 * The three visibility levels, as a list of explained choices.
 *
 * Used twice: once for the clinic-wide setting on booking settings, and once
 * per practitioner. The per-practitioner use disables anything wider than the
 * clinic setting, mirroring the server's rule that an override may only narrow
 * — switching the clinic to "Don't show" has to hide everyone, so the UI must
 * not be able to express something the server would clamp anyway.
 */
export function PractitionerVisibilitySelect({
  value,
  onChange,
  workspaceDefault,
  disabled,
  label = 'Patient visibility',
}: PractitionerVisibilitySelectProps) {
  const isOverrideMode = workspaceDefault !== undefined;

  const options: {
    key: string;
    visibility: PractitionerVisibility | null;
    label: string;
    description: string;
  }[] = [
    ...(workspaceDefault
      ? [
          {
            key: 'INHERIT',
            visibility: null,
            label: `Use the clinic setting (${VISIBILITY_META[workspaceDefault].label})`,
            description:
              'Follows whatever the clinic-wide setting is, now and later.',
          },
        ]
      : []),
    ...PRACTITIONER_VISIBILITIES.map((visibility) => ({
      key: visibility,
      visibility,
      label: VISIBILITY_META[visibility].label,
      description: VISIBILITY_META[visibility].description,
    })),
  ];

  const hasLockedOption =
    isOverrideMode &&
    PRACTITIONER_VISIBILITIES.some(
      (visibility) => !isVisibilityAllowed(workspaceDefault, visibility),
    );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {options.map((option) => {
          const isBlocked =
            isOverrideMode &&
            option.visibility !== null &&
            !isVisibilityAllowed(workspaceDefault, option.visibility);
          const isSelected = value === option.visibility;

          return (
            <button
              key={option.key}
              type="button"
              disabled={disabled || isBlocked}
              onClick={() => onChange(option.visibility)}
              className={cn(
                'flex w-full flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition',
                isSelected && 'border-primary bg-primary/5',
                isBlocked && 'cursor-not-allowed opacity-50',
                !isBlocked && !isSelected && 'hover:bg-muted/50',
              )}
            >
              <span className="flex items-center gap-1.5 text-sm font-medium">
                {option.label}
                {isBlocked && <Lock className="size-3" />}
              </span>
              <span className="text-muted-foreground text-xs">
                {isBlocked
                  ? 'Not available while the clinic-wide setting is more restrictive.'
                  : option.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Without this the locked rows are a dead end: the setting that locked
          them lives on another page, and nothing here says which. */}
      {hasLockedOption && (
        <p className="text-muted-foreground text-xs">
          To unlock the wider options, raise the clinic-wide setting in{' '}
          <Link
            href="/bookings/availability"
            className="text-primary underline"
          >
            booking settings
          </Link>
          .
        </p>
      )}
    </div>
  );
}
