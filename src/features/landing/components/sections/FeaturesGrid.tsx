"use client";

import { motion } from "framer-motion";
import { Card } from "@/shared/ui/Card";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { BarChartIcon, GridIcon, DatabaseIcon } from "../icons";

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
  return (
    <section
      id="features"
      className="scroll-mt-28 py-20 sm:py-24 md:py-28 bg-white"
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
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.06} className="h-full">
              <MotionCard
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group/card relative rounded-2xl p-6 sm:p-8 text-center h-full flex flex-col items-center ring-0 transition-all duration-300 ${
                  f.featured
                    ? "bg-brand-green-deep text-white shadow-card hover:shadow-cta-hover"
                    : "bg-brand-mint-soft text-brand-dark shadow-none hover:bg-brand-green-deep hover:text-white hover:shadow-cta-hover"
                }`}
              >
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-5 sm:mb-6 transition-all duration-300 group-hover/card:scale-110 group-hover/card:-rotate-6 ${
                    f.featured
                      ? "bg-white text-brand-dark"
                      : "bg-brand-leaf-2 text-brand-dark group-hover/card:bg-white"
                  }`}
                >
                  <f.icon className="w-8 h-8 sm:w-9 sm:h-9" strokeWidth={2.2} />
                </div>
                <h3
                  className={`text-lg sm:text-xl font-bold mb-2.5 sm:mb-3 transition-colors duration-300 ${
                    f.featured
                      ? "text-white"
                      : "text-brand-dark group-hover/card:text-white"
                  }`}
                >
                  {f.title}
                </h3>
                <p
                  className={`text-[14.5px] sm:text-[15px] leading-relaxed transition-colors duration-300 ${
                    f.featured
                      ? "text-white/90"
                      : "text-brand-text group-hover/card:text-white/90"
                  }`}
                >
                  {f.body}
                </p>
              </MotionCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
