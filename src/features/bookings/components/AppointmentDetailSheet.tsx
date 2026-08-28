'use client';

import { Badge } from '@/shared/ui/Badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/Sheet';
import {
  CalendarClock,
  CalendarX2,
  ClipboardList,
  Clock,
  Phone,
  Stethoscope,
  StickyNote,
  User,
} from 'lucide-react';
import { APPOINTMENT_STATUS_LABELS, type Appointment } from '../types';
import {
  APPOINTMENT_STATUS_ICONS,
  APPOINTMENT_STATUS_VARIANTS,
  formatSlotDate,
  formatSlotTime,
} from '../utils/appointmentFormat';
import { AppointmentStatusActions } from './AppointmentStatusActions';

interface AppointmentDetailSheetProps {
  appointment: Appointment | null;
  timezone: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--surface-2)] text-[var(--ink-mute)]">
        <Icon size={13} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
          {label}
        </p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

export function AppointmentDetailSheet({
  appointment,
  timezone,
  open,
  onOpenChange,
}: AppointmentDetailSheetProps) {
  if (!appointment) return null;

  const StatusIcon = APPOINTMENT_STATUS_ICONS[appointment.status];
  const name = appointment.customerName ?? appointment.lead?.name ?? 'Unnamed lead';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[400px]">

        {/* Header */}
        <SheetHeader className="border-b border-[var(--line)] px-5 py-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div className="flex flex-col gap-1">
              <SheetTitle className="text-[15px] font-semibold text-[var(--ink)]">
                {name}
              </SheetTitle>
              {appointment.customerPhone && (
                <span className="flex items-center gap-1.5 text-[12px] text-[var(--ink-mute)]">
                  <Phone size={11} />
                  {appointment.customerPhone}
                </span>
              )}
            </div>
            <Badge
              variant={APPOINTMENT_STATUS_VARIANTS[appointment.status]}
              className="mt-0.5 shrink-0 gap-1 text-[10.5px]"
            >
              <StatusIcon size={10} />
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
          </div>
        </SheetHeader>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">

          {/* Time slot box — simple, neutral */}
          <div className="flex items-center gap-3 self-start rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-4 py-3">
            <CalendarClock size={16} className="shrink-0 text-[var(--ink-mute)]" />
            <div className="flex flex-col">
              <span className="text-[11px] text-[var(--ink-mute)]">
                {formatSlotDate(appointment.scheduledAt, timezone)}
              </span>
              <span className="text-[17px] font-semibold tabular-nums text-[var(--ink)]">
                {formatSlotTime(appointment.scheduledAt, timezone)}
              </span>
            </div>
            <span className="ml-1 flex items-center gap-1 self-end pb-0.5 text-[11px] text-[var(--ink-mute)]">
              <Clock size={11} />
              {appointment.durationMinutes} min
            </span>
          </div>

          <div className="h-px bg-[var(--line-soft)]" />

          <div className="flex flex-col gap-4">
            <DetailRow icon={User} label="Customer">
              <span className="text-[13px] font-medium text-[var(--ink)]">{name}</span>
              {appointment.lead && (
                <span className="ml-1.5 text-[11.5px] text-[var(--ink-mute)]">via lead</span>
              )}
            </DetailRow>

            {appointment.practitioner && (
              <DetailRow icon={Stethoscope} label="Doctor">
                <span className="text-[13px] font-medium text-[var(--ink)]">
                  {appointment.practitioner.title
                    ? `${appointment.practitioner.title} ${appointment.practitioner.fullName}`
                    : appointment.practitioner.fullName}
                </span>
                {(appointment.practitioner.designation ??
                  appointment.practitioner.specialties[0]) && (
                  <p className="text-[11.5px] text-[var(--ink-mute)]">
                    {appointment.practitioner.designation ??
                      appointment.practitioner.specialties[0]}
                  </p>
                )}
              </DetailRow>
            )}

            {appointment.clinicalService && (
              <DetailRow icon={ClipboardList} label="Service">
                <span className="text-[13px] text-[var(--ink)]">
                  {appointment.clinicalService.name}
                </span>
                {appointment.clinicalService.category && (
                  <p className="text-[11.5px] text-[var(--ink-mute)]">
                    {appointment.clinicalService.category}
                  </p>
                )}
              </DetailRow>
            )}

            {appointment.notes && (
              <DetailRow icon={StickyNote} label="Notes">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--ink-soft)]">
                  {appointment.notes}
                </p>
              </DetailRow>
            )}

            {appointment.cancelReason && (
              <DetailRow icon={CalendarX2} label="Cancellation reason">
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-destructive">
                  {appointment.cancelReason}
                </p>
              </DetailRow>
            )}
          </div>
        </div>

        {/* Footer — actions */}
        <div className="border-t border-[var(--line)] px-5 py-3">
          <p className="mb-2.5 text-[10.5px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
            Actions
          </p>
          <AppointmentStatusActions appointment={appointment} wrap />
        </div>

      </SheetContent>
    </Sheet>
  );
}
