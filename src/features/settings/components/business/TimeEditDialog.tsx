"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/Dialog";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "../../types";

export interface TimeApplyData {
  open: string;
  close: string;
  mode: "single" | "all" | "selective";
  selectedWeekdays: Weekday[];
}

interface TimeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekday: Weekday | null;
  initialOpen: string;
  initialClose: string;
  onApply: (data: TimeApplyData) => void;
}

export function TimeEditDialog({
  open,
  onOpenChange,
  weekday,
  initialOpen,
  initialClose,
  onApply,
}: TimeEditDialogProps) {
  const [openTime, setOpenTime] = useState(initialOpen || "09:00");
  const [closeTime, setCloseTime] = useState(initialClose || "18:00");
  const [mode, setMode] = useState<"single" | "all" | "selective">("single");
  const [selectedWeekdays, setSelectedWeekdays] = useState<Weekday[]>(
    weekday ? [weekday] : [...WEEKDAYS],
  );

  useEffect(() => {
    if (open) {
      setOpenTime(initialOpen || "09:00");
      setCloseTime(initialClose || "18:00");
      setMode("single");
      setSelectedWeekdays(weekday ? [weekday] : [...WEEKDAYS]);
    }
  }, [open, initialOpen, initialClose, weekday]);

  const activeLabel = weekday ? WEEKDAY_LABELS[weekday] : "Day";

  const handleApply = () => {
    onApply({
      open: openTime,
      close: closeTime,
      mode,
      selectedWeekdays,
    });
    onOpenChange(false);
  };

  const toggleWeekday = (day: Weekday) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ink)]">
            <Clock size={16} className="text-[var(--accent)]" />
            Set hours for {activeLabel}
          </DialogTitle>
          <DialogDescription className="text-[12px] text-[var(--ink-mute)]">
            Choose opening and closing times and select which days to apply them to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Native HTML time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-mute)]">
                Opening time
              </label>
              <input
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                aria-label="Opening time"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-mute)]">
                Closing time
              </label>
              <input
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                aria-label="Closing time"
              />
            </div>
          </div>

          {/* Scope options */}
          <div className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-mute)]">
              Apply to
            </span>

            <label className="flex items-center gap-2.5 text-[12.5px] font-medium text-[var(--ink)] cursor-pointer">
              <input
                type="radio"
                name="applyMode"
                value="single"
                checked={mode === "single"}
                onChange={() => setMode("single")}
                className="text-[var(--accent)]"
              />
              <span>Only {activeLabel}</span>
            </label>

            <label className="flex items-center gap-2.5 text-[12.5px] font-medium text-[var(--ink)] cursor-pointer">
              <input
                type="radio"
                name="applyMode"
                value="all"
                checked={mode === "all"}
                onChange={() => setMode("all")}
                className="text-[var(--accent)]"
              />
              <span>All days (Monday – Sunday)</span>
            </label>

            <label className="flex items-center gap-2.5 text-[12.5px] font-medium text-[var(--ink)] cursor-pointer">
              <input
                type="radio"
                name="applyMode"
                value="selective"
                checked={mode === "selective"}
                onChange={() => setMode("selective")}
                className="text-[var(--accent)]"
              />
              <span>Selective days</span>
            </label>

            {/* Selective day checkboxes */}
            {mode === "selective" && (
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-2.5">
                {WEEKDAYS.map((day) => {
                  const isChecked = selectedWeekdays.includes(day);
                  return (
                    <label
                      key={day}
                      className="flex items-center gap-2 text-[12px] text-[var(--ink)] cursor-pointer"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleWeekday(day)}
                        aria-label={WEEKDAY_LABELS[day]}
                      />
                      <span>{WEEKDAY_LABELS[day]}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            className="bg-[var(--accent)] text-white hover:opacity-90"
          >
            Apply timing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
