"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Container from "../Container";
import { CtaTextLink } from "../LandingCta";
import Reveal from "../Reveal";
import {
  AIRepliesMockup,
  BroadcastMockup,
  CRMTableMockup,
  ImportLeadsMockup,
} from "../mockups";

const ITEMS = [
  {
    Mock: BroadcastMockup,
    title: "Send High-Conversion Broadcasts On WhatsApp",
    body: "Promote offers, announce new arrivals, send reminders, and follow up with existing customers directly through WhatsApp.",
    body2:
      "Perfect for sales, Eid offers, Ramadan campaigns, product launches, appointment reminders, and customer updates.",
    link: "Send Your First Broadcast",
  },
  {
    Mock: ImportLeadsMockup,
    title: "Import Leads Through Excel",
    body: "Already have customer numbers or old leads?",
    body2:
      "Upload them through an Excel sheet and start managing them inside AsaanRabta. Bring your existing contacts into one system and follow up with them faster.",
  },
  {
    Mock: AIRepliesMockup,
    title: "Let AI Answer Repeated Questions Instantly",
    body: "Customers ask the same questions every day — prices, availability, delivery, bookings, timings, product details.",
    body2:
      "AsaanRabta answers using your business information, so customers get quick replies even when your team is busy.",
    link: "Connect WhatsApp",
  },
  {
    Mock: CRMTableMockup,
    title: "Track Every Lead In A Simple CRM",
    body: "No more lost chats. No more messy spreadsheets. No more forgotten follow-ups.",
    body2:
      "Every WhatsApp inquiry is saved and organized, so your team can see who is interested, who needs follow-up, and who is ready to buy.",
  },
];

type Item = (typeof ITEMS)[number];

function CardContent({ Mock, title, body, body2, link }: Item) {
  return (
    <div className="group flex flex-col">
      <div className="mb-6 rounded-2xl transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
        <Mock />
      </div>
      <h3 className="text-[1.375rem] md:text-[1.625rem] font-bold text-brand-dark leading-tight">
        {title}
      </h3>
      <p className="mt-4 text-brand-text text-[15px] leading-relaxed">{body}</p>
      <p className="mt-3 text-brand-text text-[15px] leading-relaxed">
        {body2}{" "}
        {link && (
          <CtaTextLink className="font-semibold text-brand-dark underline underline-offset-4 hover:text-brand-green transition-colors">
            {link}
          </CtaTextLink>
        )}
      </p>
    </div>
  );
}

/**
 * Mobile stacking card. As the next card slides up to cover it, this one
 * eases back — a subtle scale + dim — so the deck reads as depth, not a hard cut.
 */
function StackCard({ item, index }: { item: Item; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 96px", "end 96px"],
  });
  // First half: card is the live top one (stays full). Second half: it's being
  // covered, so it settles back into the stack.
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0.55]);

  return (
    <div
      ref={ref}
      className="sticky pb-5"
      style={{ top: `calc(5.5rem + ${index * 0.75}rem)` }}
    >
      <motion.div
        style={{ scale, opacity, transformOrigin: "top center" }}
        className="rounded-3xl bg-white border border-gray-100 shadow-card-hover p-5 will-change-transform"
      >
        <CardContent {...item} />
      </motion.div>
    </div>
  );
}

export default function FeatureDetail() {
  return (
    <section className="py-16 sm:py-24 md:py-28 bg-white">
      <Container>
        {/* Tablet / desktop: two-column grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-x-10 gap-y-16">
          {ITEMS.map((item, i) => (
            <Reveal key={i} delay={(i % 2) * 0.1}>
              <CardContent {...item} />
            </Reveal>
          ))}
        </div>

        {/* Mobile: sticky stacking cards — each pins and the next slides up over it */}
        <div className="md:hidden">
          {ITEMS.map((item, i) => (
            <StackCard key={i} item={item} index={i} />
          ))}
          {/* Tail spacer so the last card can settle fully into view */}
          <div className="h-[30vh]" aria-hidden="true" />
        </div>
      </Container>
    </section>
  );
}
