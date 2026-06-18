"use client";

import { motion } from "framer-motion";
import { HeroDashboardMockup } from "../mockups";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import Container from "../Container";

const HEADLINE = ["Turn", "WhatsApp", "Into", "Your", "24/7", "Sales", "Team"];

export default function Hero() {
  return (
    <section className="relative hero-bg pt-12 pb-16 overflow-hidden">
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-6"
        >
          <Badge className="h-auto rounded-full border-brand-mint-2 bg-white/70 px-4 py-1.5 text-[13px] font-medium text-brand-dark/90 shadow-sm backdrop-blur-sm">
            Built for WhatsApp-first businesses
          </Badge>
        </motion.div>
        <h1 className="text-center text-[44px] sm:text-6xl md:text-7xl lg:text-[88px] font-bold leading-[1.05] tracking-tight text-brand-dark max-w-5xl mx-auto">
          {HEADLINE.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="inline-block mr-[0.25em]"
            >
              {w}
            </motion.span>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-6 text-center text-lg md:text-xl text-brand-text max-w-2xl mx-auto"
        >
          Reply faster. Manage every lead. Send broadcasts. Convert more
          customers, all from one simple platform.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button className="h-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
            Get Started
          </Button>
          <Button className="h-auto rounded-full border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50">
            See How It Works
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 max-w-[900px] mx-auto"
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        >
          <HeroDashboardMockup />
        </motion.div>
      </Container>
    </section>
  );
}
