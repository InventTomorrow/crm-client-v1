"use client";
import { Check, Clock, Loader2 } from "lucide-react";
import { Controller, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/Button";
import { CRMSwitch } from "@/shared/ui/CRMSwitch";
import { TimePicker } from "@/shared/ui/TimePicker";
import { useBusinessHoursForm } from "../../hooks/useBusinessHoursForm";
import { WEEKDAYS, WEEKDAY_LABELS, type Weekday } from "../../types";
import { SettingsSaveBar } from "../SettingsSaveBar";

function DayRow({ weekday, control, error }: {
  weekday: Weekday;
  control: ReturnType<typeof useBusinessHoursForm>["form"]["control"];
  error: string | undefined;
}) {
  const isOpen = useWatch({ control, name: `days.${weekday}.isOpen` });
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
        <span className={cn("w-24 text-[12.5px] font-medium", isOpen ? "text-[var(--ink)]" : "text-[var(--ink-mute)]")}>
          {label}
        </span>
        {isOpen ? (
          <div className="ml-auto flex items-center gap-2">
            <Controller
              name={`days.${weekday}.open`}
              control={control}
              render={({ field }) => (
                <TimePicker value={field.value} onChange={field.onChange} aria-label={`${label} opens`} className="w-28" />
              )}
            />
            <span className="text-[12px] text-[var(--ink-mute)]">to</span>
            <Controller
              name={`days.${weekday}.close`}
              control={control}
              render={({ field }) => (
                <TimePicker value={field.value} onChange={field.onChange} aria-label={`${label} closes`} className="w-28" />
              )}
            />
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
    formState: { errors, isDirty },
  } = form;
  const isOpenAllTime = useWatch({ control, name: "isOpenAllTime" });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
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
  );
}
