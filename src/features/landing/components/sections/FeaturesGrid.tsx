"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/shared/ui/Card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/Collapsible";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import {
  BarChartIcon,
  GridIcon,
  DatabaseIcon,
  PlusIcon,
  MinusIcon,
} from "../icons";

const MotionCard = motion.create(Card);

const FEATURES = [
  {
    icon: BarChartIcon,
    title: "AI Replies",
    body: "Let your AI assistant answer common customer questions instantly.",
  },
  {
    icon: GridIcon,
    title: "Chat Management",
    body: "Manage all customer conversations from one clean inbox.",
    featured: true,
  },
  {
    icon: DatabaseIcon,
    title: "Lead CRM",
    body: "Track every inquiry, follow-up, and customer status.",
  },
  {
    icon: BarChartIcon,
    title: "Broadcast Messages",
    body: "Send offers, updates, reminders, and promotions to your leads.",
  },
  {
    icon: GridIcon,
    title: "Excel Lead Import",
    body: "Upload your existing customer list and manage leads inside AsaanRabta.",
  },
  {
    icon: DatabaseIcon,
    title: "Multiple Accounts",
    body: "Connect up to 3 WhatsApp accounts and manage them from one platform.",
  },
];

export default function FeaturesGrid() {
  const isMobile = useIsMobile();
  // On mobile only one card is expanded at a time; on desktop every card is open.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="features"
      className="scroll-mt-28 py-16 sm:py-24 md:py-28 bg-white"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Everything You Need To Sell
              <br className="hidden md:block" /> Better On WhatsApp
            </>
          }
        />
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => {
            const open = !isMobile || openIndex === i;
            return (
              <Reveal key={i} delay={i * 0.06} className="h-full">
                <MotionCard
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`group/card relative rounded-2xl p-4 sm:p-8 text-left md:text-center h-full flex flex-col ring-1 transition-colors duration-300 ${
                    f.featured
                      ? "bg-brand-green-deep text-white ring-white/15 shadow-[0_14px_40px_-16px_rgba(22,165,114,0.55)] hover:shadow-[0_20px_50px_-14px_rgba(22,165,114,0.6)]"
                      : "bg-brand-mint-soft text-brand-dark ring-brand-green/10 shadow-[0_10px_30px_-18px_rgba(20,64,58,0.35)] md:hover:bg-brand-green-deep md:hover:text-white md:hover:ring-white/15 md:hover:shadow-[0_20px_50px_-14px_rgba(22,165,114,0.55)]"
                  }`}
                >
                  <Collapsible
                    open={open}
                    onOpenChange={(o) =>
                      isMobile && setOpenIndex(o ? i : null)
                    }
                  >
                    {/* Header — FAQ-style row on mobile, centered column on desktop */}
                    <CollapsibleTrigger
                      disabled={!isMobile}
                      className="w-full flex md:flex-col items-center gap-3.5 md:gap-0 outline-none cursor-pointer md:cursor-default"
                    >
                      <div
                        className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shrink-0 md:mb-6 transition-all duration-300 md:group-hover/card:scale-110 md:group-hover/card:-rotate-6 ${
                          f.featured
                            ? "bg-white text-brand-dark"
                            : "bg-brand-leaf-2 text-brand-dark md:group-hover/card:bg-white"
                        }`}
                      >
                        <f.icon
                          className="w-6 h-6 md:w-9 md:h-9"
                          strokeWidth={2.2}
                        />
                      </div>

                      <h3
                        className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                          f.featured
                            ? "text-white"
                            : "text-brand-dark md:group-hover/card:text-white"
                        }`}
                      >
                        {f.title}
                      </h3>

                      {/* Plus / minus — mobile only */}
                      <span
                        className={`md:hidden ml-auto w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          f.featured
                            ? "bg-white/15 text-white"
                            : "bg-white/70 text-brand-dark"
                        }`}
                      >
                        <motion.span
                          key={open ? "minus" : "plus"}
                          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="flex"
                        >
                          {open ? (
                            <MinusIcon className="w-4 h-4" />
                          ) : (
                            <PlusIcon className="w-4 h-4" />
                          )}
                        </motion.span>
                      </span>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="group/cc overflow-hidden ease-out animation-duration-300 data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <p
                        className={`pt-3 text-[14.5px] sm:text-[15px] leading-relaxed transition-all duration-300 opacity-0 -translate-y-1 group-data-[state=open]/cc:opacity-100 group-data-[state=open]/cc:translate-y-0 ${
                          f.featured
                            ? "text-white/90"
                            : "text-brand-text md:group-hover/card:text-white/90"
                        }`}
                      >
                        {f.body}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </MotionCard>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
