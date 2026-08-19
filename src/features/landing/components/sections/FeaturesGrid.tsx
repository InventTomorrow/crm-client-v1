"use client";

import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Card } from "@/shared/ui/Card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/ui/Collapsible";
import { motion } from "framer-motion";
import { useState } from "react";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import {
  ChatIcon,
  DatabaseIcon,
  FileSpreadsheetIcon,
  GridIcon,
  MegaphoneIcon,
  MinusIcon,
  PlusIcon,
  UsersIcon,
} from "../icons";

const MotionCard = motion.create(Card);

const FEATURES = [
  {
    icon: ChatIcon,
    title: "AI Assistant (Urdu/English)",
    body: 'Our AI understands local queries like "Price?", "Delivery kab hogi?", and "Discount milega?". It works 24/7 so you never miss a sale.',
  },
  {
    icon: GridIcon,
    title: "Shared Team Inbox",
    body: "Manage all customer conversations from one clean inbox. Stop switching between multiple phones and staff members.",
  },
  {
    icon: DatabaseIcon,
    title: "Sales CRM",
    body: 'Track every inquiry from "New Lead" to "Paid Order." No more lost chats or messy Google Sheets.',
  },
  {
    icon: MegaphoneIcon,
    title: "High-ROI Broadcasts",
    body: "Send Eid offers, flash sales, and product updates directly to your leads to drive instant revenue.",
  },
  {
    icon: FileSpreadsheetIcon,
    title: "Excel Lead Import",
    body: "Upload your existing customer lists and send your first campaign the same day.",
  },
  {
    icon: UsersIcon,
    title: "Multiple WhatsApp Accounts",
    body: "Create separate workspaces for different branches or departments, each with its own dedicated WhatsApp number.",
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
              Everything You Need To Scale
              <br className="hidden md:block" /> Your Business
            </>
          }
        />
        <div className="mt-10 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES?.map((f, i) => {
            const open = !isMobile || openIndex === i;
            return (
              <Reveal key={i} delay={i * 0.06} className="h-full">
                <MotionCard
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group/card relative rounded-2xl p-4 sm:p-8 text-left md:text-center h-full flex flex-col bg-white text-brand-dark ring-1 ring-gray-200 shadow-[0_10px_30px_-18px_rgba(20,64,58,0.3)] transition-shadow duration-300 hover:shadow-[0_18px_44px_-18px_rgba(20,64,58,0.4)]"
                >
                  <Collapsible
                    open={open}
                    onOpenChange={(o) => isMobile && setOpenIndex(o ? i : null)}
                  >
                    {/* Header — FAQ-style row on mobile, centered column on desktop */}
                    <CollapsibleTrigger className="w-full flex md:flex-col items-center gap-3.5 md:gap-0 outline-none cursor-pointer md:cursor-none">
                      <div className="w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center shrink-0 md:mb-6 bg-brand-leaf-2 text-brand-dark transition-transform duration-300 md:group-hover/card:scale-110 md:group-hover/card:-rotate-6">
                        <f.icon
                          className="w-6 h-6 md:w-9 md:h-9"
                          strokeWidth={2.2}
                        />
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-brand-dark">
                        {f.title}
                      </h3>

                      {/* Plus / minus — mobile only */}
                      <span className="md:hidden ml-auto w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-gray-100 text-brand-dark">
                        <motion.span
                          key={open ? "minus" : "plus"}
                          initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                          animate={{ rotate: 0, scale: 1, opacity: 1 }}
                          transition={{
                            duration: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                          }}
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
                      <p className="pt-3 text-[14.5px] sm:text-[15px] leading-relaxed text-brand-text transition-all duration-300 opacity-0 -translate-y-1 group-data-[state=open]/cc:opacity-100 group-data-[state=open]/cc:translate-y-0">
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
