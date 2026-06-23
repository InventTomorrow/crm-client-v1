"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../Container";
import Reveal from "../Reveal";
import { BarChartIcon, CheckIcon, HeartIcon, UsersIcon } from "../icons";

// Scroll-driven "stack opening/closing" — items fan out as the group enters the
// viewport and tuck back as it leaves (once: false replays in both directions).
const stackContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const stackItem = {
  hidden: { opacity: 0, y: 40, scale: 0.85 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const VALUES = [
  {
    icon: UsersIcon,
    title: "Clarity First",
    body: "We simplify the complex so users can act with confidence.",
  },
  {
    icon: HeartIcon,
    title: "Build With Empathy",
    body: "We design for real people, not just numbers.",
  },
  {
    icon: CheckIcon,
    title: "Always Improving",
    body: "We embrace innovation, learning, and continuous growth.",
  },
  {
    icon: BarChartIcon,
    title: "Data With Purpose",
    body: "Insights are only useful if they're actionable—we make sure they are.",
  },
];

export default function Values() {
  return (
    <section className="py-16 sm:py-24 md:py-28 bg-white">
      <Container>
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <Reveal
              as="h2"
              className="text-[1.875rem] sm:text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight text-brand-dark text-center lg:text-left"
            >
              More Than
              <br />
              <span className="whitespace-nowrap">WhatsApp Business.</span>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-brand-text text-[16px] leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                WhatsApp Business gives you basic tools. AsaanRabta gives you a
                full WhatsApp sales system.
              </p>
            </Reveal>
            <motion.div
              variants={stackContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.25 }}
              className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 gap-y-8 gap-x-5 sm:gap-x-6 max-w-lg mx-auto lg:mx-0"
            >
              {VALUES.map((v, i) => (
                <motion.div key={i} variants={stackItem} className="text-left">
                  <div className="w-10 h-10 rounded-full bg-brand-leaf flex items-center justify-center mb-3 text-brand-dark">
                    <v.icon className="w-5 h-5" strokeWidth={2.3} />
                  </div>
                  <h3 className="text-base font-bold text-brand-dark mb-1.5">
                    {v.title}
                  </h3>
                  <p className="text-brand-text text-[14px] leading-relaxed">
                    {v.body}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <Reveal delay={0.2}>
            <div className="relative rounded-3xl overflow-hidden aspect-square shadow-xl">
              <Image
                src="/landing-page-assests/professional.png"
                alt="Business owner managing WhatsApp sales"
                fill
                sizes="(max-width: 1024px) 100vw, 560px"
                quality={100}
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
