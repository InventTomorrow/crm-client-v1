"use client";
import { Clock, Tag } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { useOfferDialog } from "../hooks/useOfferDialog";
import type { ActiveOffer } from "../types";
import { OfferCountdown } from "./OfferCountdown";

interface OfferDialogProps {
  offer: ActiveOffer | null;
  /** Where the CTA sends them — the pricing section on the marketing site, billing in the app. */
  ctaHref: string;
  ctaLabel?: string;
  /** Held false until the viewer is known to be eligible, so it never flashes. */
  enabled?: boolean;
}

/**
 * The campaign's headline moment: opens itself 15 seconds in, once a day.
 * Dismissing it only closes the dialog — the banner and sidebar timer keep the
 * countdown on screen.
 */
export function OfferDialog({
  offer,
  ctaHref,
  ctaLabel = "See discounted plans",
  enabled = true,
}: OfferDialogProps) {
  const { isOpen, close } = useOfferDialog(offer, enabled);

  if (!offer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-lg">
        <div className="bg-brand-amber px-6 pb-7 pt-8 text-center text-white">
          <div className="mx-auto mb-3 flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
            <Tag className="h-3.5 w-3.5" />
            Limited time
          </div>
          <div className="text-6xl font-extrabold leading-none tracking-tight">
            {offer.discountPercent}%
          </div>
          <div className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] opacity-90">
            off every plan
          </div>
          <OfferCountdown endsAt={offer.endsAt} variant="blocks" className="mt-6" />
        </div>

        <div className="px-6 pb-6 pt-5 text-center">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-center text-lg font-bold text-ink">
              {offer.title}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-ink-mute">
              {offer.description ??
                `Upgrade before the timer runs out and pay ${offer.discountPercent}% less on any paid plan.`}
            </DialogDescription>
          </DialogHeader>

          <Link
            href={ctaHref}
            onClick={close}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white no-underline shadow-cta transition-opacity hover:opacity-90"
          >
            {ctaLabel}
          </Link>

          <button
            type="button"
            onClick={close}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-mute transition-colors hover:text-ink"
          >
            <Clock className="h-3.5 w-3.5" />
            Maybe later — the timer stays on screen
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
