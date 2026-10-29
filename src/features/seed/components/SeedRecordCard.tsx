"use client";
import { Button } from "@/shared/ui/Button";
import { FadeUp, ScaleIn } from "@/shared/ui/Motion";
import { Spinner } from "@/shared/ui/Spinner";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  Check,
  FolderOpen,
  Inbox,
  MapPin,
  ClipboardList,
  Package,
  Plus,
  Stethoscope,
  UserSearch,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useSeedRecordForm } from "../hooks/useSeedRecordForm";
import type { SeedCatalogEntry, SeedRecordType } from "../types";
import { SeedCountStepper } from "./SeedCountStepper";
import { SeedingProgress } from "./SeedingProgress";

const ICON_BY_RECORD_TYPE: Record<SeedRecordType, LucideIcon> = {
  PRODUCT: Package,
  MENU_ITEM: UtensilsCrossed,
  SERVICE_OFFERING: ClipboardList,
  CLINICAL_SERVICE: Stethoscope,
  PRACTITIONER: Users,
  JOB_APPLICANT: UserSearch,
  APPOINTMENT: CalendarClock,
  APPOINTMENT_REQUEST: Inbox,
  LEAD: Users,
  RESOURCE: FolderOpen,
  CLINIC_LOCATION: MapPin,
};

interface SeedRecordCardProps {
  entry: SeedCatalogEntry;
}

export function SeedRecordCard({ entry }: SeedRecordCardProps) {
  const { count, setCount, progress, isSeeding, isDone, seededCount, seed } =
    useSeedRecordForm(entry);
  const Icon = ICON_BY_RECORD_TYPE[entry.recordType];

  return (
    <FadeUp className="card flex flex-col gap-4 p-[18px]">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--ink)]">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold">{entry.label}</h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--ink-soft)]">{entry.description}</p>
        </div>
      </div>

      <form onSubmit={seed} className="flex items-center justify-between gap-3">
        <SeedCountStepper
          count={count}
          onChange={setCount}
          isDisabled={isSeeding}
          label={entry.label}
        />
        <Button type="submit" size="xl" disabled={isSeeding}>
          {isSeeding ? <Spinner /> : <Plus />}
          {isSeeding ? "Seeding…" : `Seed ${count}`}
        </Button>
      </form>

      <AnimatePresence mode="wait" initial={false}>
        {isSeeding && (
          <motion.div
            key="seeding"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <SeedingProgress count={count} progress={progress} />
          </motion.div>
        )}
        {isDone && (
          <ScaleIn
            key="done"
            className="flex items-center gap-2 rounded-lg bg-[var(--success-soft)] px-3 py-2 text-[12.5px] font-medium text-[var(--success-foreground)]"
          >
            <Check size={15} />
            {seededCount} {entry.label.toLowerCase()} added to your workspace
          </ScaleIn>
        )}
      </AnimatePresence>
    </FadeUp>
  );
}
