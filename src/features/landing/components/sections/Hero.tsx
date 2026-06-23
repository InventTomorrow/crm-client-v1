"use client";

import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Fragment } from "react";
import Container from "../Container";
import { PrimaryCta } from "../LandingCta";
import { HeroDashboardMockup } from "../mockups";

const HEADLINE = ["Turn", "WhatsApp", "Into", "Your", "24/7", "Sales", "Team"];

export default function Hero() {
  return (
    <section className="relative hero-bg pt-12 sm:pt-16 md:pt-20 lg:pt-24 pb-16 overflow-hidden">
      <Container className="relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center text-center mb-6"
        >
          <Badge className="h-auto rounded-full border-brand-mint-2 bg-white/70 px-4 py-1.5 text-[13px] font-medium text-brand-dark/90 shadow-sm backdrop-blur-sm">
            Built for WhatsApp-first businesses
          </Badge>
        </motion.div>
        <h1 className="text-center text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[5rem] font-bold leading-[1.08] sm:leading-[1.05] tracking-tight text-brand-dark mx-auto text-balance">
          {HEADLINE?.map((w, i) => (
            <Fragment key={i}>
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`inline-block ${w === "24/7" ? "text-brand-green" : ""}`}
              >
                {w}
              </motion.span>
              {i < HEADLINE.length - 1 ? " " : ""}
            </Fragment>
          ))}
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-5 sm:mt-6 text-center text-base sm:text-lg md:text-xl text-brand-text max-w-xl sm:max-w-2xl mx-auto text-pretty"
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
          <PrimaryCta className="h-auto w-full sm:w-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
            Get Started
          </PrimaryCta>
          <Button
            asChild
            variant="ghost"
            className="h-auto w-full sm:w-auto rounded-full border border-gray-200 bg-white px-7 py-3.5 text-base font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:border-brand-green/40 hover:bg-brand-mint hover:text-brand-dark"
          >
            <Link href="#how-it-works">See How It Works</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-14 max-w-[900px] mx-auto px-1 sm:px-0"
          style={{ transformStyle: "preserve-3d", perspective: 1200 }}
        >
          <HeroDashboardMockup />
        </motion.div>
      </Container>
    </section>
  );
}
