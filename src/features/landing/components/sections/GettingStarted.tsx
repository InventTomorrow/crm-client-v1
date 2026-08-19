"use client";

import { motion } from "framer-motion";
import Container from "../Container";
import { CtaTextLink } from "../LandingCta";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import {
  ArrowRightIcon,
  ChatIcon,
  ClockIcon,
  CloudIcon,
  ZapIcon,
} from "../icons";
import { QRLaptopMockup } from "../mockups";

const STEPS = [
  {
    icon: ZapIcon,
    title: "Scan the QR Code",
    body: "Scan the QR code with your phone to link your WhatsApp instantly, just like WhatsApp Web.",
  },
  {
    icon: ClockIcon,
    title: "Add Your Business Numbers",
    body: "Connect up to 3 WhatsApp accounts to manage all your branches and teams in one place.",
  },
  {
    icon: CloudIcon,
    title: "Start Closing Sales",
    body: "Your AI agent starts replying 24/7, turning your WhatsApp inquiries into confirmed orders.",
  },
];

export default function GettingStarted() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 py-16 sm:py-24 md:py-28 bg-white"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Get Your AI Sales Agent
              <br className="hidden md:block" /> Running In 60 Seconds
            </>
          }
          subtitle="Getting started is simple. No code, no developers, no waiting."
        />
        <div className="mt-10 sm:mt-16 grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <Reveal>
            <QRLaptopMockup />
          </Reveal>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-4 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none select-none absolute -right-1 -translate-y-1/2 top-1/2 text-7xl sm:text-8xl font-extrabold leading-none text-brand-green/20 pr-2"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="relative w-12 h-12 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="relative">
                    <h3 className="text-lg font-bold text-brand-dark">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-brand-text text-[15px] leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-2 gap-y-3 text-center text-[15px] text-brand-dark">
            <span className="inline-flex items-center gap-2 text-brand-text">
              <ChatIcon className="w-5 h-5 shrink-0 text-brand-dark" />
              Simple setup, and it keeps up as you grow.
            </span>
            <CtaTextLink className="font-semibold underline underline-offset-4 inline-flex items-center gap-1 text-brand-dark hover:text-brand-green transition-colors">
              Connect WhatsApp <ArrowRightIcon className="w-4 h-4" />
            </CtaTextLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
