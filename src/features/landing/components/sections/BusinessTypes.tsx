"use client";

import { motion } from "framer-motion";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { Button } from "@/shared/ui/Button";

const INDUSTRIES = [
  { name: "Clothing brands", emoji: "👗", bg: "from-rose-200 to-rose-100" },
  { name: "Clinics", emoji: "🩺", bg: "from-sky-200 to-blue-100" },
  { name: "Salons", emoji: "💇", bg: "from-pink-200 to-rose-100" },
  { name: "Restaurants", emoji: "🍽️", bg: "from-amber-200 to-orange-100" },
  {
    name: "Real estate agencies",
    emoji: "🏠",
    bg: "from-slate-200 to-stone-100",
  },
  { name: "Online stores", emoji: "🛍️", bg: "from-yellow-200 to-amber-100" },
  { name: "Travel agents", emoji: "✈️", bg: "from-cyan-200 to-sky-100" },
];

export default function BusinessTypes() {
  return (
    <section
      id="who-its-for"
      className="scroll-mt-28 py-20 md:py-24 bg-brand-mint"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Built For Businesses That Sell
              <br className="hidden md:block" /> Through WhatsApp
            </>
          }
          subtitle="AsaanRabta is made for businesses where customers message before they buy."
        />
        <div className="mt-14 flex flex-wrap justify-center gap-6 md:gap-8">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={i} delay={i * 0.05} className="flex flex-col items-center">
              <motion.div
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-gradient-to-br ${ind.bg} flex items-center justify-center text-5xl shadow-card`}
              >
                {ind.emoji}
              </motion.div>
              <div className="mt-3 text-[13px] font-medium text-brand-dark">
                {ind.name}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12 flex justify-center">
            <Button className="h-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
              Create Your Account
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
