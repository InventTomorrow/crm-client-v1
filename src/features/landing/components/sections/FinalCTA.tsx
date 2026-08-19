"use client";
import { Button } from "@/shared/ui/Button";
import { useState } from "react";
import Container from "../Container";
import { PrimaryCta } from "../LandingCta";
import Reveal from "../Reveal";
import { CTAFloatingPhone } from "../mockups";
import { WatchDemoModal } from "../WatchDemoModal";

export default function FinalCTA() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="py-16 md:py-20 bg-white">
      <Container>
        <Reveal>
          <div className="relative rounded-[24px] sm:rounded-[28px] bg-brand-dark overflow-hidden p-7 sm:p-10 md:p-16">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl lg:text-[44px] font-bold leading-[1.1] tracking-tight text-white text-center lg:text-left">
                  Ready To Manage
                  <br /> WhatsApp Leads Smarter?
                </h2>
                <p className="mt-6 text-white/70 text-[15px] md:text-base leading-relaxed max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                  Your next customer may already be waiting in your WhatsApp
                  inbox. AsaanRabta helps you reply faster, keep track of every
                  lead, and turn more chats into orders.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3">
                  <PrimaryCta className="h-auto w-full sm:w-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
                    Get Started Today
                  </PrimaryCta>
                  <Button
                    variant="ghost"
                    onClick={() => setDemoOpen(true)}
                    className="h-auto w-full sm:w-auto rounded-full border border-transparent bg-white px-7 py-3.5 text-base font-semibold text-brand-dark transition-all hover:-translate-y-0.5 hover:bg-brand-mint hover:text-brand-dark"
                  >
                    Watch Demo
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block relative h-[440px]">
                <CTAFloatingPhone />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
      <WatchDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
