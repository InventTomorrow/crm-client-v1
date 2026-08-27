'use client';
import { Label } from '@/shared/ui/Label';
import { cn } from '@/lib/utils';
import { Lock } from 'lucide-react';
import {
  isVisibilityAllowed,
  PRACTITIONER_VISIBILITIES,
  VISIBILITY_META,
  type PractitionerVisibility,
} from '../types';

interface PractitionerVisibilitySelectProps {
  /** null means "inherit the clinic default". */
  value: PractitionerVisibility | null;
  onChange: (visibility: PractitionerVisibility | null) => void;
  workspaceDefault: PractitionerVisibility;
  disabled?: boolean;
}

/**
 * Per-practitioner visibility.
 *
 * Options wider than the clinic-wide setting are disabled, mirroring the
 * server's rule that an override may only narrow: switching the clinic to
 * "Don't show" has to hide everyone, so the UI must not be able to express
 * something the server would clamp anyway.
 */
export function PractitionerVisibilitySelect({
  value,
  onChange,
  workspaceDefault,
  disabled,
}: PractitionerVisibilitySelectProps) {
  const options: {
    key: string;
    visibility: PractitionerVisibility | null;
    label: string;
    description: string;
  }[] = [
    {
      key: 'INHERIT',
      visibility: null,
      label: `Use the clinic setting (${VISIBILITY_META[workspaceDefault].label})`,
      description:
        'Follows whatever the clinic-wide setting is, now and later.',
    },
    ...PRACTITIONER_VISIBILITIES.map((visibility) => ({
      key: visibility,
      visibility,
      label: VISIBILITY_META[visibility].label,
      description: VISIBILITY_META[visibility].description,
    })),
  ];

  return (
    <div className="space-y-2">
      <Label>Patient visibility</Label>
      <div className="space-y-2">
        {options.map((option) => {
          const isBlocked =
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
    </div>
  );
}
