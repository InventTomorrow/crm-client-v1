'use client';
import type { ClinicalService } from '@/features/clinical-services/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/RadioGroup';
import { Clock, MapPin, Phone, Siren, Stethoscope } from 'lucide-react';
import { useState } from 'react';
import { coverageCellKey } from '../hooks/useClinicCoverage';
import {
  areaLabel,
  COVERAGE_META,
  type ClinicLocation,
  type CoverageArea,
  type CoverageLevel,
  type ResolvedCoverageLevel,
} from '../types';
import { COVERAGE_DISPLAY_ORDER, COVERAGE_DOT_TONE } from '../utils/coverageTone';

/** The one cell the dialog is editing. */
export interface CoverageCellTarget {
  service: ClinicalService;
  area: CoverageArea;
  level: ResolvedCoverageLevel;
}

interface CoverageStatusDialogProps {
  target: CoverageCellTarget | null;
  /** The branch that owns this area, when one is on file — summary only. */
  location: ClinicLocation | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    service: ClinicalService;
    area: CoverageArea;
    coverage: CoverageLevel | 'UNKNOWN';
  }) => void;
}

/**
 * Changes one service's coverage in one area, with the branch it belongs to
 * spelled out first. What each status makes the assistant say is the part that
 * gets picked wrong, so the descriptions sit next to the choice, not in a legend.
 */
export function CoverageStatusDialog({
  target,
  location,
  onOpenChange,
  onSubmit,
}: Readonly<CoverageStatusDialogProps>) {
  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update coverage</DialogTitle>
          <DialogDescription>
            What the assistant should answer for this service here.
          </DialogDescription>
        </DialogHeader>

        {target && (
          // Keyed per cell so the picker starts on that cell's own status
          // rather than being reset by an effect on every open.
          <CoverageStatusForm
            key={coverageCellKey(target.service.id, target.area)}
            target={target}
            location={location}
            onSubmit={onSubmit}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CoverageStatusForm({
  target,
  location,
  onSubmit,
  onDone,
}: Readonly<{
  target: CoverageCellTarget;
  location: ClinicLocation | null;
  onSubmit: CoverageStatusDialogProps['onSubmit'];
  onDone: () => void;
}>) {
  const [selectedLevel, setSelectedLevel] = useState<ResolvedCoverageLevel>(
    target.level,
  );

  const save = () => {
    if (selectedLevel !== target.level) {
      onSubmit({
        service: target.service,
        area: target.area,
        coverage: selectedLevel,
      });
    }
    onDone();
  };

  return (
    <>
      <div className="bg-muted/40 space-y-2 rounded-lg border p-3">
        <p className="flex items-center gap-2 text-sm font-medium">
          <Stethoscope className="text-muted-foreground size-4 shrink-0" />
          {target.service.name}
        </p>
        <p className="flex items-center gap-2 text-sm">
          <MapPin className="text-muted-foreground size-4 shrink-0" />
          <span>
            {areaLabel(target.area)}
            {location?.branchName && (
              <span className="text-muted-foreground">
                {' '}
                · {location.branchName}
              </span>
            )}
          </span>
        </p>
        {location?.addressLine && (
          <p className="text-muted-foreground pl-6 text-xs">
            {location.addressLine}
          </p>
        )}
        {(location?.contactPhone ||
          location?.handlesEmergencies ||
          location?.isOpen24x7) && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 pl-6 text-xs">
            {location.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="size-3" />
                {location.contactPhone}
              </span>
            )}
            {location.handlesEmergencies && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Siren className="size-3" />
                Emergencies
              </Badge>
            )}
            {location.isOpen24x7 && (
              <Badge variant="secondary" className="gap-1 font-normal">
                <Clock className="size-3" />
                24/7
              </Badge>
            )}
          </div>
        )}
      </div>

      <RadioGroup
        value={selectedLevel}
        onValueChange={(nextLevel) =>
          setSelectedLevel(nextLevel as ResolvedCoverageLevel)
        }
      >
        {COVERAGE_DISPLAY_ORDER.map((level) => (
          <label
            key={level}
            htmlFor={`coverage-level-${level}`}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
              selectedLevel === level
                ? 'border-primary bg-primary/5'
                : 'hover:bg-muted/50',
            )}
          >
            <RadioGroupItem
              id={`coverage-level-${level}`}
              value={level}
              className="mt-0.5"
            />
            <span className="space-y-0.5">
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  aria-hidden
                  className={cn('size-2 rounded-full', COVERAGE_DOT_TONE[level])}
                />
                {COVERAGE_META[level].label}
              </span>
              <span className="text-muted-foreground block text-xs leading-relaxed">
                {COVERAGE_META[level].description}
              </span>
            </span>
          </label>
        ))}
      </RadioGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={save} disabled={selectedLevel === target.level}>
          Save status
        </Button>
      </DialogFooter>
    </>
  );
}
