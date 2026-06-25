"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../Container";
import Reveal from "../Reveal";
import { CheckIcon } from "../icons";

// Scroll-driven "stack opening/closing" — items fan out as the group enters the
// viewport and tuck back as it leaves (once: false replays in both directions).
const stackContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const stackItem = {
  hidden: { opacity: 0, y: 24, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const CAPABILITIES = [
  "Answer customer questions with AI",
  "Manage all chats from one dashboard",
  "Track every lead in a CRM",
  "Send broadcast campaigns",
  "Upload leads through Excel",
  "Connect up to 3 WhatsApp accounts",
  "Let your team take over chats anytime",
];

export default function Values() {
  return (
    <section className="py-16 sm:py-24 md:py-28 bg-white">
      <Container className="!max-w-[1320px]">
        <div className="grid lg:grid-cols-[1.55fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <Reveal
              as="h2"
              className="text-[1.875rem] sm:text-[2.25rem] md:text-[2.5rem] lg:text-[2.75rem] font-bold leading-[1.12] tracking-tight text-brand-dark text-center lg:text-left text-balance"
            >
              More Than WhatsApp Business.
              <br className="hidden lg:block" /> Simpler Than a Traditional CRM.
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-brand-text text-[16px] leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                WhatsApp Business gives you basic tools. AsaanRabta gives you a
                full WhatsApp sales system.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-7 text-[15px] font-semibold text-brand-dark text-center lg:text-left">
                With AsaanRabta, you can:
              </p>
            </Reveal>
            <motion.ul
              variants={stackContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.25 }}
              className="mt-4 grid sm:grid-cols-2 gap-x-8 gap-y-3 max-w-xl mx-auto lg:mx-0"
            >
              {CAPABILITIES.map((c) => (
                <motion.li
                  key={c}
                  variants={stackItem}
                  className="flex items-start gap-3 text-left"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-leaf-2 text-brand-dark">
                    <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-brand-text text-[15px] leading-snug">
                    {c}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
            <Reveal delay={0.2}>
              <p className="mt-7 text-brand-text text-[16px] leading-relaxed max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
                Everything works together, so your business can respond faster
                and close more leads.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="relative rounded-3xl overflow-hidden aspect-square lg:aspect-[4/5] max-w-[440px] mx-auto w-full shadow-xl">
              <Image
                src="/landing-page-assests/professional.png"
                alt="Business owner managing WhatsApp sales"
                fill
                sizes="(max-width: 1024px) 100vw, 440px"
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
