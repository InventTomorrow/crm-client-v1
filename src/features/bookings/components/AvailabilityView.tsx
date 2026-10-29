"use client";
import { Button } from "@/shared/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookingConfigForm } from "./BookingConfigForm";

/** The booking settings editor — one config per workspace, so this is a page rather than a dialog. */
export function AvailabilityView() {
  const router = useRouter();
  const backToAppointments = () => router.push("/bookings");

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          aria-label="Back to appointments"
          onClick={backToAppointments}
        >
          <ArrowLeft size={16} />
        </Button>
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">
            Availability
          </h1>
          <p className="text-[12px] text-[var(--ink-mute)]">
            The slots your bot is allowed to offer, and what it says when one is
            taken.
          </p>
        </div>
      </div>

      <BookingConfigForm
        onSaved={backToAppointments}
        onCancel={backToAppointments}
      />
    </div>
  );
}
