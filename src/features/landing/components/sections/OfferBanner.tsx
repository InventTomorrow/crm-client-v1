"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { OfferCountdown } from "@/features/offers/components/OfferCountdown";
import type { ActiveOffer } from "@/features/offers/types";
import { ZapIcon } from "../icons";

/**
 * Marketing-site campaign strip. The offer is fetched by the server component
 * that renders this one, so the headline is in the SSR HTML — only the
 * countdown waits for hydration.
 */
export default function OfferBanner({ offer }: { offer: ActiveOffer | null }) {
  const [visible, setVisible] = useState(true);

  if (!offer) return null;

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-50 overflow-hidden bg-brand-amber text-white"
        >
          <div className="relative mx-auto flex max-w-[1392px] flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-10 py-2.5 text-center text-[13px] font-medium sm:text-sm">
            <ZapIcon className="hidden h-4 w-4 shrink-0 sm:block" />
            <p>
              <span className="font-semibold">{offer.title}:</span> get{" "}
              <span className="font-semibold">{offer.discountPercent}% off</span>{" "}
              every plan.
            </p>
            <OfferCountdown
              endsAt={offer.endsAt}
              className="rounded-md bg-white/20 px-2 py-0.5"
            />
            <button
              type="button"
              aria-label="Dismiss offer"
              onClick={() => setVisible(false)}
              className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
