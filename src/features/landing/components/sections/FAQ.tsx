"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { PlusIcon, MinusIcon } from "../icons";
import { LANDING_FAQ_ITEMS } from "@/features/landing/constants";

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="scroll-mt-28 py-16 sm:py-24 md:py-28 bg-white">
      <Container>
        <SectionHeading
          title={
            <>
              Why Businesses Use
              <br className="hidden md:block" /> AsaanRabta
            </>
          }
          subtitle="Got questions? We've got you covered—here are some quick answers to help you get the most out of AsaanRabta."
        />
        <div className="mt-14 max-w-3xl mx-auto space-y-3">
          {LANDING_FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} delay={i * 0.05}>
                <motion.div
                  layout
                  className="bg-brand-mint-soft rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="w-full px-6 py-5 flex items-start justify-between text-left gap-4 transition-colors hover:bg-brand-mint cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="text-base md:text-lg font-bold text-brand-dark">
                        {item.question}
                      </h3>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.p
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{
                              opacity: 1,
                              height: "auto",
                              marginTop: 8,
                            }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="text-brand-text text-[14px] leading-relaxed overflow-hidden"
                          >
                            {item.answer}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center text-brand-dark flex-shrink-0 mt-1">
                      {isOpen ? (
                        <MinusIcon className="w-5 h-5" />
                      ) : (
                        <PlusIcon className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
