"use client";

import { motion } from "framer-motion";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import {
  ZapIcon,
  ClockIcon,
  CloudIcon,
  ChatIcon,
  ArrowRightIcon,
} from "../icons";
import { CtaTextLink } from "../LandingCta";
import { QRLaptopMockup } from "../mockups";

const STEPS = [
  {
    icon: ZapIcon,
    title: "Scan the QR Code",
    body: "Connect your WhatsApp account by scanning a QR code.",
  },
  {
    icon: ClockIcon,
    title: "Connect Up to 3 Accounts",
    body: "Manage multiple business numbers, branches, or teams from one platform.",
  },
  {
    icon: CloudIcon,
    title: "Manage From One Dashboard",
    body: "Chats, AI replies, leads, broadcasts, and follow-ups, all in one place.",
  },
];

export default function GettingStarted() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 py-24 md:py-28 bg-white"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Start Managing WhatsApp
              <br className="hidden md:block" /> Leads In Minutes
            </>
          }
          subtitle="Getting started is simple."
        />
        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-stretch">
          <Reveal>
            <QRLaptopMockup />
          </Reveal>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 flex items-start gap-4 shadow-card hover:shadow-card-hover transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
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
          <div className="mt-12 flex items-center justify-center gap-2 text-[15px] text-brand-dark">
            <ChatIcon className="w-5 h-5 text-brand-dark" />
            <span className="text-brand-text">
              Connect Your WhatsApp. No code. No integrations. Just scan and
              start replying smarter.
            </span>
            <CtaTextLink className="font-semibold underline underline-offset-4 flex items-center gap-1 text-brand-dark hover:text-brand-green transition-colors">
              Connect WhatsApp <ArrowRightIcon className="w-4 h-4" />
            </CtaTextLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
