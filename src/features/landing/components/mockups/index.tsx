"use client";

// Product artwork for the landing page — real app screenshots served from
// /public/landing-page-assests. Component names are kept stable so the section
// files don't need to change. The original hand-built HTML mockups live in
// ./legacy.tsx for later reuse.

import { motion } from "framer-motion";
import Image from "next/image";

const ASSET = "/landing-page-assests";

/* ------------------------------------------------------------------ */
/*  Hero — Leads pipeline dashboard                                    */
/* ------------------------------------------------------------------ */
export function HeroDashboardMockup() {
  return (
    <div className="relative rounded-xl sm:rounded-2xl border border-gray-100 shadow-dashboard overflow-hidden aspect-[899/396]">
      <Image
        src={`${ASSET}/1.png`}
        alt="AsaanRabta leads pipeline dashboard"
        fill
        sizes="(max-width: 940px) 100vw, 900px"
        quality={100}
        className="object-cover"
        priority
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Manage Every Chat — WhatsApp inbox dashboard                       */
/* ------------------------------------------------------------------ */
export function InboxDashboardMockup() {
  return (
    <div className="relative rounded-2xl border border-gray-100 shadow-dashboard overflow-hidden aspect-[1592/936]">
      <Image
        src={`${ASSET}/5.png`}
        alt="WhatsApp shared inbox dashboard"
        fill
        sizes="(max-width: 768px) 100vw, 620px"
        quality={90}
        className="object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CRM lead table                                                     */
/* ------------------------------------------------------------------ */
export function CRMTableMockup() {
  return (
    <div className="relative rounded-2xl border border-gray-100 shadow-dashboard overflow-hidden aspect-[5/3.5]">
      <Image
        src={`${ASSET}/1.png`}
        alt="Lead CRM pipeline"
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        quality={100}
        className="object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI replies — WhatsApp conversation                                 */
/* ------------------------------------------------------------------ */
export function AIRepliesMockup() {
  return (
    <div className="relative rounded-2xl border border-gray-100 shadow-dashboard overflow-hidden aspect-[5/3.5]">
      <Image
        src={`${ASSET}/5.png`}
        alt="AI answering WhatsApp messages"
        fill
        sizes="(max-width: 768px) 100vw, 600px"
        quality={90}
        className="object-cover"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Broadcast composer                                                 */
/* ------------------------------------------------------------------ */
export function BroadcastMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-dashboard aspect-[5/3.5] bg-gradient-to-b from-emerald-700 to-emerald-500 flex items-center justify-center p-4">
      <Image
        src={`${ASSET}/4.png`}
        alt="WhatsApp broadcast recipient selection"
        width={489}
        height={978}
        sizes="280px"
        quality={100}
        className="h-full w-auto object-contain drop-shadow-xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Import leads from Excel                                            */
/* ------------------------------------------------------------------ */
export function ImportLeadsMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden shadow-dashboard aspect-[5/3.5] bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center p-4">
      <Image
        src={`${ASSET}/3.png`}
        alt="Bulk import leads from a CSV"
        width={497}
        height={993}
        sizes="280px"
        quality={100}
        className="h-full w-auto object-contain drop-shadow-xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR code on laptop (Getting Started)                                */
/* ------------------------------------------------------------------ */
export function QRLaptopMockup() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-blue-50 to-emerald-50 p-3 sm:p-5 flex items-center justify-center aspect-[5/4] h-full">
      <Image
        src={`${ASSET}/2.png`}
        alt="Scan the QR code to connect WhatsApp"
        width={576}
        height={474}
        sizes="(max-width: 1024px) 92vw, 560px"
        quality={100}
        className="w-full max-w-xl object-contain drop-shadow-md"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  "Stop losing leads" phone in tinted backdrop                       */
/* ------------------------------------------------------------------ */
export function StopLosingLeadsPhone() {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-teal-500/80 to-emerald-700/80 p-6 sm:p-10 flex items-center justify-center aspect-[5/4]">
      <Image
        src={`${ASSET}/6.png`}
        alt="WhatsApp assistant replying instantly"
        width={489}
        height={978}
        sizes="320px"
        quality={100}
        className="h-full w-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA — floating phone                                         */
/* ------------------------------------------------------------------ */
export function CTAFloatingPhone() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-full flex items-center justify-center"
      >
        <Image
          src={`${ASSET}/6.png`}
          alt="WhatsApp assistant conversation"
          width={489}
          height={978}
          sizes="280px"
          quality={100}
          className="h-full w-auto object-contain drop-shadow-2xl"
        />
      </motion.div>
    </div>
  );
}
