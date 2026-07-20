"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { formatOfferCountdown, getOfferDaysRemaining } from "../../constants";
import { ZapIcon } from "../icons";

export default function OfferBanner() {
  const [visible, setVisible] = useState(true);
  const daysRemaining = getOfferDaysRemaining();

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
          <div className="relative mx-auto flex max-w-[1392px] items-center justify-center gap-2.5 px-10 py-2.5 text-center text-[13px] font-medium sm:text-sm">
            <ZapIcon className="hidden h-4 w-4 shrink-0 sm:block" />
            <p>
              <span className="font-semibold">Launch offer —</span> get the
              Starter plan at{" "}
              <span className="font-semibold">50% off</span>.{" "}
              {formatOfferCountdown(daysRemaining)}.
            </p>
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
