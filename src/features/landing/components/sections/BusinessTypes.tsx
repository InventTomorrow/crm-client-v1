"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "../Container";
import Reveal from "../Reveal";
import SectionHeading from "../SectionHeading";
import { PrimaryCta } from "../LandingCta";

const ASSET = "/landing-page-assests";

const INDUSTRIES = [
  { name: "Clothing brands", img: `${ASSET}/clothing-brands.png` },
  { name: "Clinics", img: `${ASSET}/clinics.png` },
  { name: "Salons", img: `${ASSET}/salons.png` },
  { name: "Restaurants", img: `${ASSET}/restaurants.png` },
  { name: "Real estate agencies", img: `${ASSET}/real-estate-agencies.png` },
  { name: "Online stores", img: `${ASSET}/online-stores.png` },
  { name: "Travel agents", img: `${ASSET}/travel-agents.png` },
];

export default function BusinessTypes() {
  return (
    <section
      id="who-its-for"
      className="scroll-mt-28 py-14 sm:py-20 md:py-24 bg-brand-mint"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Built For Businesses That Sell
              <br /> Through WhatsApp
            </>
          }
          subtitle="AsaanRabta is made for businesses where customers message before they buy."
        />
        <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-5 sm:gap-6 md:gap-8">
          {INDUSTRIES.map((ind, i) => (
            <Reveal key={i} delay={i * 0.05} className="flex flex-col items-center">
              <motion.div
                whileHover={{ y: -6, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative w-24 h-24 md:w-28 md:h-28 rounded-3xl overflow-hidden shadow-card"
              >
                <Image
                  src={ind.img}
                  alt={ind.name}
                  fill
                  sizes="112px"
                  quality={100}
                  className="object-cover"
                />
              </motion.div>
              <div className="mt-3 text-[13px] font-medium text-brand-dark">
                {ind.name}
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.3}>
          <div className="mt-12 flex justify-center">
            <PrimaryCta className="h-auto rounded-full bg-brand-green px-7 py-3.5 text-base font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
              Create Your Account
            </PrimaryCta>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
