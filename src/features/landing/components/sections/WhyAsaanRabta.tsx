"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/Carousel";
import { motion } from "framer-motion";
import Container from "../Container";
import SectionHeading from "../SectionHeading";
import {
  BarChartIcon,
  ClockIcon,
  DatabaseIcon,
  GridIcon,
  ZapIcon,
} from "../icons";

const REASONS = [
  {
    icon: ZapIcon,
    title: "Win Leads While They Are Still Interested",
    body: "Fast AI replies help you close customers before they message your competitor.",
  },
  {
    icon: ClockIcon,
    title: "Save Your Team Hours Every Day",
    body: "Automate 90% of your customer queries so your team can focus on closing big deals.",
  },
  {
    icon: DatabaseIcon,
    title: "Never Lose Track of a Customer",
    body: "A dedicated CRM means every lead is a potential sale that you can follow up with.",
  },
  {
    icon: GridIcon,
    title: "Manage Multiple Numbers Easily",
    body: "Connect multiple business numbers to one dashboard and see the full picture.",
  },
  {
    icon: BarChartIcon,
    title: "Grow Without Hiring More Staff",
    body: "Handle more WhatsApp conversations without increasing your team size.",
  },
];

export default function WhyAsaanRabta() {
  return (
    <section className="py-16 sm:py-24 md:py-28 bg-gradient-to-br from-brand-mint-3 via-brand-mint to-brand-leaf-2/60">
      <Container className="!max-w-[1360px]">
        <SectionHeading
          title={
            <>
              Why Businesses Use{" "}
              <span className="text-brand-green">AsaanRabta</span>
            </>
          }
        />
        <Carousel
          opts={{ align: "start" }}
          className="relative mt-10 sm:mt-16 px-0 sm:px-14"
          aria-label="Why businesses use AsaanRabta"
        >
          <CarouselContent className="-ml-4">
            {REASONS.map((r) => (
              <CarouselItem
                key={r.title}
                className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
              >
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group/card h-full rounded-2xl p-6 sm:p-7 text-left bg-white text-brand-dark ring-1 ring-gray-200 shadow-[0_10px_30px_-18px_rgba(20,64,58,0.3)] transition-shadow duration-300 hover:shadow-[0_18px_44px_-18px_rgba(20,64,58,0.4)]"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-brand-leaf-2 text-brand-dark transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-6">
                    <r.icon className="w-6 h-6" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark leading-snug">
                    {r.title}
                  </h3>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-brand-text">
                    {r.body}
                  </p>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Edge fades — hint that more cards exist beyond the viewport */}
          <div className="pointer-events-none absolute inset-y-0 left-0 sm:left-14 w-12 sm:w-20 bg-gradient-to-r from-brand-mint-3 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 sm:right-14 w-12 sm:w-20 bg-gradient-to-l from-brand-leaf-2/60 to-transparent" />

          <CarouselPrevious
            className="h-full bg-transparent border-none hover:bg-transparent"
            iconClassName="size-16"
          />

          <CarouselNext
            className="h-full bg-transparent border-none hover:bg-transparent "
            iconClassName="size-16"
          />
        </Carousel>
      </Container>
    </section>
  );
}
