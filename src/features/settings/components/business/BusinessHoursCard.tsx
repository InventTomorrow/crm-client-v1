"use client";
import { useState } from "react";
import { Check, Clock, Loader2 } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMSwitch } from "@/shared/ui/CRMSwitch";
import { formatTimeLabel } from "@/shared/ui/TimePicker";
import { useBusinessHoursForm } from "../../hooks/useBusinessHoursForm";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "../../types";
import { SettingsSaveBar } from "../SettingsSaveBar";
import { TimeEditDialog, type TimeApplyData } from "./TimeEditDialog";

function DayRow({
  weekday,
  control,
  error,
  onEdit,
}: {
  weekday: Weekday;
  control: ReturnType<typeof useBusinessHoursForm>["form"]["control"];
  error: string | undefined;
  onEdit: (day: Weekday) => void;
}) {
  const isOpen = useWatch({ control, name: `days.${weekday}.isOpen` });
  const openTime = useWatch({ control, name: `days.${weekday}.open` });
  const closeTime = useWatch({ control, name: `days.${weekday}.close` });
  const label = WEEKDAY_LABELS[weekday];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <Controller
          name={`days.${weekday}.isOpen`}
          control={control}
          render={({ field }) => (
            <CRMSwitch on={field.value} onChange={field.onChange} />
          )}
        />
        <span
          className={cn(
            "w-24 text-[12.5px] font-medium",
            isOpen ? "text-[var(--ink)]" : "text-[var(--ink-mute)]",
          )}
        >
          {label}
        </span>
        {isOpen ? (
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(weekday)}
              className="flex items-center gap-2 h-8.5 min-w-[100px] justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-[12px] text-[var(--ink)] hover:bg-[var(--surface-subtle)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
              aria-label={`${label} opening time`}
            >
              <Clock size={13} className="text-[var(--ink-mute)] shrink-0" />
              <span>{formatTimeLabel(openTime) || openTime || "Pick time"}</span>
            </button>
            <span className="text-[12px] text-[var(--ink-mute)]">to</span>
            <button
              type="button"
              onClick={() => onEdit(weekday)}
              className="flex items-center gap-2 h-8.5 min-w-[100px] justify-center rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 text-[12px] text-[var(--ink)] hover:bg-[var(--surface-subtle)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
              aria-label={`${label} closing time`}
            >
              <Clock size={13} className="text-[var(--ink-mute)] shrink-0" />
              <span>{formatTimeLabel(closeTime) || closeTime || "Pick time"}</span>
            </button>
          </div>
        ) : (
          <span className="ml-auto text-[12px] text-[var(--ink-mute)]">Closed</span>
        )}
      </div>
      {error && <p className="mt-2 text-[11px] text-[var(--destructive)]">{error}</p>}
    </div>
  );
}

export function BusinessHoursCard() {
  const { form, submit, isLoading, isSaving } = useBusinessHoursForm();
  const {
    control,
    setValue,
    formState: { errors, isDirty },
  } = form;
  const isOpenAllTime = useWatch({ control, name: "isOpenAllTime" });
  const [editingDay, setEditingDay] = useState<Weekday | null>(null);

  const initialOpen = editingDay ? form.getValues(`days.${editingDay}.open`) : "09:00";
  const initialClose = editingDay ? form.getValues(`days.${editingDay}.close`) : "18:00";

  const handleApplyTime = ({
    open,
    close,
    mode,
    selectedWeekdays,
  }: TimeApplyData) => {
    const targets =
      mode === "all"
        ? WEEKDAYS
        : mode === "selective"
          ? selectedWeekdays
          : editingDay
            ? [editingDay]
            : [];

    for (const day of targets) {
      setValue(`days.${day}.open`, open, { shouldDirty: true, shouldValidate: true });
      setValue(`days.${day}.close`, close, { shouldDirty: true, shouldValidate: true });
      if (mode !== "single") {
        setValue(`days.${day}.isOpen`, true, { shouldDirty: true, shouldValidate: true });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <>
      <form noValidate onSubmit={submit} className="card p-[22px] flex flex-col gap-5">
        <div>
          <h3 className="flex items-center gap-2 text-[15px] font-semibold">
            <Clock size={16} className="text-[var(--accent)]" /> Business hours
          </h3>
          <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
            Follow-ups set to &quot;Business hours&quot; wait for these hours. Restaurants and clinics also
            have their assistant tell customers when you are open. Times are Pakistan time (Asia/Karachi).
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3.5 py-3">
          <div>
            <p className="text-[12.5px] font-medium text-[var(--ink)]">Open all the time</p>
            <p className="mt-0.5 text-[11px] text-[var(--ink-mute)]">
              Turn off to choose the days you are open and the hours for each day.
            </p>
          </div>
          <Controller
            name="isOpenAllTime"
            control={control}
            render={({ field }) => <CRMSwitch on={field.value} onChange={field.onChange} size="md" />}
          />
        </div>

        {!isOpenAllTime && (
          <div className="flex flex-col gap-2">
            {WEEKDAYS.map((weekday) => (
              <DayRow
                key={weekday}
                weekday={weekday}
                control={control}
                error={errors.days?.[weekday]?.close?.message}
                onEdit={(day) => setEditingDay(day)}
              />
            ))}
            {errors.days?.message && <p className="text-[11.5px] text-[var(--destructive)]">{errors.days.message}</p>}
          </div>
        )}

        <SettingsSaveBar variant="inset">
          <Button type="submit" disabled={isSaving || !isDirty}>
            {isSaving ? (
              <><Loader2 size={13} className="animate-spin" /> Saving…</>
            ) : (
              <><Check size={14} /> Save business hours</>
            )}
          </Button>
        </SettingsSaveBar>
      </form>

      <TimeEditDialog
        open={editingDay !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingDay(null);
        }}
        weekday={editingDay}
        initialOpen={initialOpen}
        initialClose={initialClose}
        onApply={handleApplyTime}
      />
    </>
  );
}
