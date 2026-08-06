'use client';
import { Button } from '@/shared/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BookingConfigForm } from './BookingConfigForm';

/** The booking settings editor — one config per workspace, so this is a page rather than a dialog. */
export function AvailabilityView() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--ink)]">Availability</h1>
          <p className="text-[12px] text-[var(--ink-mute)]">
            The slots your bot is allowed to offer, and what it says when one is taken.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={() => router.push('/bookings')}>
          <ArrowLeft size={13} className="mr-1.5" /> Back to appointments
        </Button>
      </div>

      <BookingConfigForm onSaved={() => router.push('/bookings')} />
    </div>
  );
}
