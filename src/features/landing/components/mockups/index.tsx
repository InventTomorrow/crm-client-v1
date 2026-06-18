"use client";

// All visual UI mockups used as artwork in the landing page.
// These are deliberately decorative: hand-composed Tailwind to mimic the
// product without shipping real product screenshots.

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  WhatsAppIcon,
  SearchIcon,
  MenuIcon,
  SmileIcon,
  CheckIcon,
  ArrowRightIcon,
  PlusIcon,
  ChevronDownIcon,
  GridIcon,
  DatabaseIcon,
  ClockIcon,
  FileSpreadsheetIcon,
  UsersIcon,
} from "../icons";

/* ------------------------------------------------------------------ */
/*  Phone bezel wrapper                                                */
/* ------------------------------------------------------------------ */
type PhoneFrameProps = {
  children: ReactNode;
  className?: string;
  width?: number;
  height?: number;
};

export function PhoneFrame({
  children,
  className = "",
  width = 280,
  height = 560,
}: PhoneFrameProps) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width }}>
      <div className="relative rounded-[44px] bg-black p-[10px] shadow-phone">
        <div
          className="relative rounded-[36px] overflow-hidden bg-white"
          style={{ height }}
        >
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[110px] h-[26px] bg-black rounded-b-[16px] z-20" />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WhatsApp chat phone (green bg, three animated bubbles)             */
/* ------------------------------------------------------------------ */
export function WhatsAppChatPhone() {
  return (
    <PhoneFrame width={280} height={540}>
      <div className="h-full flex flex-col bg-gradient-to-b from-emerald-700 via-emerald-700 to-emerald-800">
        <div className="flex justify-between items-center px-5 pt-3 text-white text-[10px] font-medium">
          <span>4:30</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span>●●●●●</span>
            <span>📶</span>
            <span>🔋</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5 px-4 pt-6 pb-3">
          <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center">
            <WhatsAppIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">
              WhatsApp Assistant
            </div>
            <div className="text-white/60 text-[10px]">Replying instantly</div>
          </div>
        </div>
        <div className="flex-1 px-3 py-4 space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex"
          >
            <div className="bg-emerald-300 text-emerald-900 text-[11px] px-3 py-2 rounded-2xl rounded-tl-sm max-w-[78%] shadow-sm">
              Pls enquiry! I am noning what an thot ggp Availabber stent
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex"
          >
            <div className="bg-white text-brand-dark text-[11px] px-3 py-2 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
              Omerty, price is oustlele produner your available fill you get.
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="flex justify-end"
          >
            <div className="bg-emerald-400 text-emerald-900 text-[11px] px-3 py-2 rounded-2xl rounded-tr-sm max-w-[70%] shadow-sm inline-flex items-center gap-1">
              Get your cheessoarge? <CheckIcon className="w-3 h-3" />
            </div>
          </motion.div>
        </div>
        <div className="flex justify-around items-center px-4 pb-5 pt-2 border-t border-white/10">
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[9px]">
            SDIE TOAT
          </div>
          <div className="w-6 h-6 rounded-full bg-white/20" />
          <div className="w-6 h-6 rounded-full bg-white/20" />
        </div>
        <div className="h-1.5 w-32 rounded-full bg-white/40 mx-auto mb-2" />
      </div>
    </PhoneFrame>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero — WhatsApp Business Management dashboard (3 columns)          */
/* ------------------------------------------------------------------ */
export function HeroDashboardMockup() {
  const chats = [
    {
      name: "Ineza Chmdic",
      msg: "Hi! I'm here for what?",
      time: "37.0M",
      avatarBg: "bg-rose-200",
      tag: true,
    },
    {
      name: "Mash andbx",
      msg: "Thus card customerend",
      time: "11 AM",
      avatarBg: "bg-amber-200",
    },
    {
      name: "Mycb radlor",
      msg: "On you eed customerd",
      time: "14 AM",
      avatarBg: "bg-indigo-200",
    },
    {
      name: "Domharerd",
      msg: "'Anide ichae conneonads",
      time: "21 PM",
      avatarBg: "bg-emerald-200",
      tag: true,
    },
    {
      name: "Sanranetidon",
      msg: "'A boey arti is coustomerd",
      time: "12 AM",
      avatarBg: "bg-fuchsia-200",
    },
  ];
  const leads = [
    {
      name: "Abtualissky Cnoft...",
      msg: "Toast to home / monery: ago",
      tag: "#25.male",
      action: "Upset",
      avatar: "bg-rose-300",
    },
    {
      name: "Traical Ne Wont ...",
      msg: "Toast to home / monery: ago",
      tag: "#25.male",
      action: "Low",
      avatar: "bg-blue-300",
    },
    {
      name: "Cheater Somany ...",
      msg: "",
      tag: "",
      action: "",
      avatar: "bg-amber-300",
      time: "3:17M",
    },
  ];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-dashboard overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
      <div className="min-w-[760px]">
      <div className="flex items-center px-4 h-14 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white">
            <WhatsAppIcon className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <div className="text-[12px] font-semibold text-brand-dark">
              WhatsApp
            </div>
            <div className="text-[9px] text-gray-400">Business Management</div>
          </div>
        </div>
        <div className="flex-1 mx-6 max-w-md">
          <div className="flex items-center bg-gray-50 rounded-full px-3 py-1.5 text-[11px] text-gray-400 border border-gray-100">
            <SearchIcon className="w-3 h-3 mr-1.5" />
            Search abdc rencager
            <MenuIcon className="w-3 h-3 ml-auto" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SmileIcon className="w-4 h-4 text-gray-400" />
          <span className="text-[12px] text-brand-dark font-medium">Kabir</span>
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-indigo-300 ring-2 ring-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[8px] font-bold text-white">
              1
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[230px_1fr_240px] h-[340px]">
        <div className="border-r border-gray-100 overflow-hidden">
          <div className="flex items-center px-3 h-9 border-b border-gray-100 text-[11px] text-brand-dark font-medium">
            <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center mr-2">
              <WhatsAppIcon className="w-3 h-3 text-white" />
            </div>
            Inbox Chmdic
            <span className="ml-auto text-gray-300">...</span>
          </div>
          {chats.map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2 px-3 py-2 border-b border-gray-50"
            >
              <div
                className={`w-7 h-7 rounded-full ${c.avatarBg} flex-shrink-0`}
              />
              <div className="flex-1 min-w-0">
                {c.tag && (
                  <div className="inline-block px-1.5 py-0.5 rounded-full bg-brand-green text-white text-[8px] font-medium mb-0.5">
                    All in inem sor w!
                  </div>
                )}
                <div className="text-[11px] font-semibold text-brand-dark truncate">
                  {c.name}
                </div>
                <div className="text-[9px] text-gray-400 truncate">{c.msg}</div>
              </div>
              <div className="text-[9px] text-gray-400 flex-shrink-0">
                {c.time}
              </div>
            </div>
          ))}
        </div>
        <div className="border-r border-gray-100 flex flex-col bg-gray-50/40">
          <div className="flex items-center gap-2 px-4 h-9 border-b border-gray-100 bg-white">
            <div className="w-6 h-6 rounded-full bg-amber-200" />
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-brand-dark">
                AI Assistant
              </div>
              <div className="text-[8px] text-gray-400">
                Reply to a person right!
              </div>
            </div>
            <span className="text-gray-300 text-xs">...</span>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2.5 overflow-hidden">
            <div className="text-center text-[8px] text-gray-400">Today</div>
            <div className="flex justify-end">
              <div className="bg-brand-green/90 text-white text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tr-sm max-w-[70%] shadow-sm">
                AVe cvmtnme noi en?
              </div>
            </div>
            <div className="flex">
              <div className="bg-white text-brand-dark text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm max-w-[75%] border border-gray-100">
                Why beada, six surto neny? you&apos;re <span>😊</span>
              </div>
            </div>
            <div className="text-center text-[8px] text-gray-400">
              Twvtdng dverager kss
            </div>
            <div className="flex">
              <div className="bg-white text-brand-dark text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%] border border-gray-100">
                Martstape who c8Gbi leacimello, suister johal
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 h-9 border-t border-gray-100 bg-white">
            {["🎁", "🌟", "🎉", "✨", "🎈", "🎀", "🎊"].map((e, i) => (
              <span key={i} className="text-[12px]">
                {e}
              </span>
            ))}
            <div className="ml-auto w-6 h-6 rounded-full bg-rose-300" />
          </div>
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center px-3 h-9 border-b border-gray-100 text-[11px] font-semibold text-brand-dark">
            Lead CRM
          </div>
          {leads.map((l, i) => (
            <div key={i} className="px-3 py-2.5 border-b border-gray-50">
              <div className="flex items-start gap-2">
                <div
                  className={`w-7 h-7 rounded-full ${l.avatar} flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-brand-dark truncate">
                      {l.name}
                    </div>
                    {l.time && (
                      <div className="text-[8px] text-gray-400">{l.time}</div>
                    )}
                  </div>
                  <div className="text-[9px] text-gray-400 truncate">
                    {l.msg}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {l.tag && (
                      <span className="text-[8px] text-brand-green font-medium">
                        {l.tag}
                      </span>
                    )}
                    {l.action && (
                      <span
                        className={`text-[8px] px-1.5 py-0.5 rounded ${l.action === "Upset" ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}
                      >
                        ⊘ {l.action}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Manage Every Chat — dark inbox dashboard                           */
/* ------------------------------------------------------------------ */
export function InboxDashboardMockup() {
  const sidebar = [
    "Shoning",
    "Conversatics",
    "Conversations",
    "Customered",
    "Tonsanes",
    "Conpersions",
    "Details",
    "Asstheed",
  ];
  const activeIdx = 3;
  const rows = [
    { name: "Larampat AI", sub: "Monel Leokap", tag: "Nelik" },
    {
      name: "Lom imbet F4Il",
      sub: "Mokeya- berten ant pyrmestament.",
      tag: "Nelik",
    },
    {
      name: "Lom ingetps FRl",
      sub: "Minerya decaies, alter dity ned ascordi.",
      tag: "Nelik",
    },
    {
      name: "Lom intherr PRll",
      sub: "Markya derberi tuit you wokmuett.",
      tag: "Nelik",
    },
    {
      name: "Lom inberis Pllii",
      sub: "Markya dervaiy on your wonkmert.",
      tag: "Nelik",
    },
    { name: "This Ineet M", sub: "Monel Leokap", tag: "" },
    { name: "Tere inge' All", sub: "Seerlyo dilluien enter cataget...", tag: "Nelik" },
  ];
  return (
    <div
      className="bg-white rounded-2xl shadow-dashboard overflow-hidden border border-gray-100"
      style={{ aspectRatio: "5/3.5" }}
    >
      <div className="flex items-center gap-1.5 px-3 h-7 bg-brand-dark-2">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="flex-1 text-center text-white/60 text-[11px] font-medium">
          Shared
        </div>
        <div className="text-white/40 text-[10px]">Smith</div>
      </div>
      <div className="grid grid-cols-[160px_1fr_140px] bg-brand-dark-2 text-white h-[calc(100%-28px)]">
        <div className="border-r border-white/5 p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center">
              <WhatsAppIcon className="w-3 h-3 text-white" />
            </div>
            <div className="text-[10px] font-semibold">Ny WatApp</div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded text-[10px] mb-3">
            <SearchIcon className="w-3 h-3" />
            <span>WhatsApp</span>
          </div>
          <div className="space-y-1">
            {sidebar.map((s, i) => (
              <div
                key={i}
                className={`px-2 py-1.5 rounded text-[10px] ${i === activeIdx ? "bg-brand-green text-white" : "text-white/60 hover:bg-white/5"}`}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#22332E] flex flex-col">
          <div className="flex items-center gap-2 px-3 h-9 border-b border-white/5">
            <ArrowRightIcon className="w-3 h-3 rotate-180 text-white/50" />
            <div className="px-2 py-1 rounded bg-brand-green text-white text-[10px]">
              Convertse
            </div>
            <div className="text-[10px] text-white/50">Stop Wnetiel</div>
          </div>
          <div className="flex-1 overflow-hidden">
            {rows.map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 border-b border-white/5 hover:bg-white/5"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold truncate">
                    {c.name}
                  </div>
                  <div className="text-[9px] text-white/50 truncate">
                    {c.sub}
                  </div>
                </div>
                {c.tag && (
                  <div className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                    {c.tag}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 h-8 border-t border-white/5 text-[10px] text-white/40">
            <PlusIcon className="w-3 h-3" />
            Customersres soni of that
            <div className="ml-auto w-3 h-3 rounded-full bg-brand-green" />
          </div>
        </div>
        <div className="bg-[#1A2825] border-l border-white/5 p-3 space-y-3">
          <div className="text-[10px] font-semibold flex items-center gap-1.5">
            <UsersIcon className="w-3 h-3" />
            Human Detail
          </div>
          <div className="flex items-center gap-2">
            <DatabaseIcon className="w-3 h-3 text-white/40" />
            <div className="text-[9px] text-white/60">
              Kennworks
              <br />
              <span className="text-[8px] text-white/40">Customer Daw...</span>
            </div>
          </div>
          <div className="text-[9px] text-white/50">
            <div className="flex items-center gap-1">
              <SearchIcon className="w-2.5 h-2.5" /> Customer is
            </div>
            <div className="mt-1 leading-tight text-[8px]">
              Kewmod is sgye
              <br />
              bessou by Thai...
            </div>
          </div>
          <div className="text-[9px] text-white/50">
            <div className="font-semibold mb-1">III Loss</div>
            <div className="text-[8px] leading-tight">
              The repdiarying gi
              <br />
              nayonmal arelyght
              <br />
              AI Bask thain ase i<br />
              Mosrumer the prie
              <br />
              Pertiection that ad
            </div>
          </div>
          <div className="text-[8px] text-white/50 leading-tight">
            Dy cortineris commi
            <br />
            conginiosre is the m<br />
            compromise is the m<br />
            carecten naeth airi
            <br />
            shvejy in your folle
          </div>
          <div className="text-[8px] text-brand-green/80 font-mono">
            Deepfantesco
            <br />
            sumesh
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CRM lead table mockup                                              */
/* ------------------------------------------------------------------ */
export function CRMTableMockup() {
  const rows = Array.from({ length: 9 }).map(() => ({
    a: "Castinarth.",
    b: "Cestilup",
    c: "tellord",
    d: "Castloard",
    e: "Castimerd",
    f: "Follow ad",
  }));
  return (
    <div
      className="bg-white rounded-2xl shadow-dashboard border border-gray-100 overflow-hidden"
      style={{ aspectRatio: "5/3.5" }}
    >
      <div className="flex items-center gap-1.5 px-3 h-7 bg-gray-50 border-b border-gray-100">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="flex-1 text-center text-gray-400 text-[11px]">
          CRM sublectrd
        </div>
      </div>
      <div className="grid grid-cols-[140px_1fr_120px] h-[calc(100%-28px)]">
        <div className="bg-gray-50 border-r border-gray-100 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center">
              <WhatsAppIcon className="w-3 h-3 text-white" />
            </div>
          </div>
          {[GridIcon, ClockIcon, FileSpreadsheetIcon, UsersIcon].map((I, i) => (
            <I key={i} className="w-3.5 h-3.5 text-gray-400" />
          ))}
        </div>
        <div className="p-3">
          <div className="text-[10px] text-gray-500 mb-1">CRM Lead</div>
          <div className="text-sm font-bold text-brand-dark mb-2">CRM Lead</div>
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Customers selic ⌄
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Contmend
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
              Follow-upp
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              ⌖ Pdit
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              Stat. Sturce
            </span>
          </div>
          <div className="bg-gray-50 rounded border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-1.5 text-[9px] font-semibold text-gray-500 bg-gray-100">
              <div>Whatsapp</div>
              <div>Follow-up</div>
              <div>Tinketup</div>
              <div />
              <div className="text-right">Follow-up</div>
            </div>
            {rows.map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] gap-2 px-2 py-1.5 text-[9px] border-b border-gray-100 items-center"
              >
                <div className="text-gray-600">{r.a}.</div>
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px]">
                    {r.b}
                  </span>{" "}
                  {r.c}
                </div>
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[8px]">
                    {r.d}
                  </span>
                </div>
                <div className="text-gray-500">{r.e}</div>
                <div className="text-right text-gray-500">{r.f}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-l border-gray-100 p-2 bg-white">
          <div className="text-[10px] text-gray-400 mb-2">Discrip Source</div>
          <div className="text-[9px] font-semibold mb-2">An Daxy nies</div>
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-purple-300 flex-shrink-0" />
              <div className="text-[8px] leading-tight">
                <div className="font-semibold text-brand-dark">Slati-MEr</div>
                <div className="text-gray-400">Figh curri mip. 11/7</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Broadcast composer mockup                                          */
/* ------------------------------------------------------------------ */
export function BroadcastMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-dashboard h-full"
      style={{ aspectRatio: "5/3.5" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-700 to-emerald-500" />
      <svg
        className="absolute bottom-0 left-0 right-0 w-full"
        viewBox="0 0 500 80"
        preserveAspectRatio="none"
      >
        <path d="M0,40 Q125,80 250,40 T500,40 L500,80 L0,80 Z" fill="#16A572" />
      </svg>
      <div className="relative p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center">
            <WhatsAppIcon className="w-4 h-4 text-white" />
          </div>
          <div className="text-white font-bold text-lg">thatsApp Cennignne</div>
        </div>
        <div className="mt-2 text-white/80 text-[10px] leading-snug max-w-xs">
          Cau WhatsApps capiagn complaser hud as oves arecity the pasrtacts
          cornect.
          <br />
          finstuddiing one ampouser is torles dour WhatsApp afficlorus
          you&apos;lr ssliantgy.
        </div>
      </div>
      <div className="absolute left-4 top-[55%] -translate-y-1/2 bg-brand-dark-2 rounded-lg p-2 w-[34%] space-y-1.5">
        {[
          "Gabuspy",
          "Comeslony",
          "Resaikiia",
          "Pacine Fodity",
          "Lait Pays",
          "WhatsApp",
          "Solilning",
          "Spaclext",
          "Spotyetner",
          "Woollses",
        ].map((n, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-amber-300 to-pink-300 flex-shrink-0" />
            <span className="text-white/80 text-[8px]">{n}</span>
          </div>
        ))}
      </div>
      <div className="absolute right-4 top-[40%] -translate-y-1/2 bg-white rounded-lg shadow-lg p-3 w-[44%]">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-brand-green flex items-center justify-center">
              <WhatsAppIcon className="w-2 h-2 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-brand-dark">
              WhatsAmp
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <ChevronDownIcon className="w-3 h-3" />
            <PlusIcon className="w-3 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 text-[9px]">
          <div className="text-gray-400 mb-0.5">Recipient</div>
          <div className="text-gray-400 mb-0.5">Recipment</div>
          <div className="text-brand-green">+ Hare</div>
        </div>
        <div className="bg-gray-50 rounded p-2 mb-2 h-14 text-[9px] text-gray-400">
          Recout
        </div>
        <div className="bg-gray-50 rounded px-2 py-1.5 mb-2 flex items-center gap-1.5">
          <SearchIcon className="w-2.5 h-2.5 text-gray-400" />
          <span className="text-[9px] text-gray-400">Rrequiet</span>
        </div>
        <div className="bg-gray-50 rounded px-2 py-1.5 mb-2 text-[9px] text-gray-400">
          Ant you who riss churd!
        </div>
        <button className="w-full bg-brand-green text-white text-[10px] py-1.5 rounded font-medium">
          Lear Reply
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Import leads from Excel mockup                                     */
/* ------------------------------------------------------------------ */
export function ImportLeadsMockup() {
  const contacts = [
    { name: "Mirven Wettinal", info: "Powsenh 12.515", num: 70 },
    { name: "Batney in Free", info: "Boowanh 19478", num: 70 },
    { name: "Jon Louead", info: "Concents 19.353", num: 30 },
    { name: "Sont tymin Card", info: "Bonscoth 12345", num: 30 },
    { name: "Jess a Sninwey", info: "Sosanenis 11122", num: 70 },
    { name: "Jen lop Wialles", info: "Powanh 11050", num: 40 },
    { name: "Jon Borum Pard", info: "Contacts 12064", num: 55 },
    { name: "Johsap Fafe", info: "Browisemh 7724.110", num: 31 },
  ];
  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full bg-gradient-to-br from-amber-200 to-amber-400"
      style={{ aspectRatio: "5/3.5" }}
    >
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-xs">
          <div className="bg-white px-3 py-2 flex items-center justify-between text-[9px] text-gray-500 border-b border-gray-100">
            <span>11:31 9:02 PM</span>
            <span>9:17 4% 116.0%</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
            <ArrowRightIcon className="w-3 h-3 rotate-180 text-brand-dark" />
            <span className="text-[12px] font-semibold text-brand-dark">
              WhatsAip CaMs
            </span>
            <span className="ml-auto text-gray-400 text-xs">⋯</span>
          </div>
          <div className="px-3 py-2 flex items-center gap-2 border-b border-gray-100">
            <div className="flex-1 bg-gray-100 rounded-full px-2.5 py-1.5 text-[9px] text-gray-400 flex items-center gap-1.5">
              <SearchIcon className="w-2.5 h-2.5" />
              day amadimcsion
            </div>
            <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[9px]">
              📷
            </div>
            <span className="text-gray-400">⋯</span>
          </div>
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-brand-green">
                Leal What Lead
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            </div>
            <span className="text-gray-400 text-xs">✕</span>
          </div>
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-gray-100 text-[9px]">
            <span className="text-gray-500">← Conselapp</span>
            <span className="text-gray-400">›</span>
          </div>
          <div className="max-h-44 overflow-hidden">
            {contacts.map((p, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 border-b border-gray-50"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-300 to-pink-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] font-semibold text-brand-dark truncate">
                    {p.name}
                  </div>
                  <div className="text-[8px] text-gray-400 truncate">
                    {p.info}
                  </div>
                </div>
                <div className="text-[9px] text-gray-500">{p.num}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI replies mockup (reuses chat phone)                              */
/* ------------------------------------------------------------------ */
export function AIRepliesMockup() {
  return (
    <div
      className="relative rounded-2xl overflow-hidden h-full bg-emerald-900/85 flex items-center justify-center"
      style={{ aspectRatio: "5/3.5" }}
    >
      <WhatsAppChatPhone />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR code on laptop (Getting Started)                                */
/* ------------------------------------------------------------------ */
export function QRLaptopMockup() {
  // Static randomized QR grid (deterministic between renders is fine for art).
  const qrCells = Array.from({ length: 144 }).map(
    (_, i) => i % 3 === 0 || i % 7 === 0,
  );
  const smallQR = Array.from({ length: 36 }).map(
    (_, i) => i % 3 === 1 || i % 5 === 0,
  );
  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 via-blue-50 to-emerald-50 p-4 sm:p-8 flex items-center justify-center"
      style={{ aspectRatio: "5/4" }}
    >
      <div className="relative w-full max-w-md">
        <div
          className="rounded-t-xl bg-gradient-to-br from-gray-200 to-gray-100 p-3 pb-2 shadow-xl border border-gray-200"
          style={{ transform: "perspective(800px) rotateX(8deg)" }}
        >
          <div className="bg-white rounded-md overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="ml-2 px-3 py-0.5 bg-white rounded text-[7px] text-gray-400 border border-gray-100">
                app.AsaanRabta.com
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center mb-2">
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </div>
              <div className="text-[10px] font-semibold text-brand-dark mb-3">
                WhatsApp Login Required
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white p-1.5 rounded">
                  <div className="grid grid-cols-12 gap-px w-24 h-24">
                    {qrCells.map((on, i) => (
                      <div key={i} className={on ? "bg-black" : "bg-white"} />
                    ))}
                  </div>
                </div>
                <div className="relative w-12 h-20 rounded-lg bg-black p-0.5 shadow">
                  <div className="bg-gradient-to-b from-emerald-500 to-emerald-700 rounded-md w-full h-full flex items-center justify-center">
                    <div className="grid grid-cols-6 gap-px w-8 h-8 bg-white p-0.5 rounded">
                      {smallQR.map((on, i) => (
                        <div key={i} className={on ? "bg-black" : "bg-white"} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[7px] text-gray-400">
                Prepared you Thade Gtideid
              </div>
              <div className="mt-2 text-[6px] text-gray-300 text-center">
                Bewur unisaing and wenel code thal a meer rinurin
              </div>
            </div>
          </div>
        </div>
        <div className="h-2 bg-gradient-to-b from-gray-200 to-gray-300 rounded-b-xl mx-3 shadow" />
        <div className="h-1.5 bg-gray-400/30 rounded-b-full mx-12" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  "Stop losing leads" phone in tinted backdrop                        */
/* ------------------------------------------------------------------ */
export function StopLosingLeadsPhone() {
  return (
    <div
      className="rounded-3xl bg-gradient-to-br from-teal-500/80 to-emerald-700/80 p-4 sm:p-8 flex items-center justify-center"
      style={{ aspectRatio: "5/4" }}
    >
      <WhatsAppChatPhone />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Final CTA — floating phone with chat bubbles                       */
/* ------------------------------------------------------------------ */
export function CTAFloatingPhone() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <PhoneFrame width={240} height={490}>
          <div className="h-full flex flex-col bg-white">
            <div className="flex justify-between items-center px-4 pt-3 text-brand-dark text-[10px] font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1 text-[8px]">📶 📶 🔋</div>
            </div>
            <div className="flex items-center gap-2 px-3 pt-4 pb-2 border-b border-gray-100">
              <ArrowRightIcon className="w-3 h-3 rotate-180 text-brand-dark" />
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-rose-300" />
              <div>
                <div className="text-[10px] font-semibold text-brand-dark">
                  Amelia Taylor
                </div>
                <div className="text-[8px] text-gray-400">
                  WhatsApp Devices and Sccu
                </div>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-2 bg-gradient-to-b from-white to-gray-50/50">
              <div className="flex">
                <div className="bg-emerald-100 text-emerald-900 text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                  Hi, God bless you!{" "}
                  <span className="text-[7px] text-gray-400 ml-1">
                    9:41 a.m.
                  </span>
                </div>
              </div>
              <div className="flex">
                <div className="bg-emerald-100 text-emerald-900 text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tl-sm max-w-[80%] shadow-sm">
                  Thank you so much!{" "}
                  <span className="text-[7px] text-gray-400 ml-1">
                    9:41 a.m.
                  </span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-emerald-300 text-emerald-900 text-[10px] px-2.5 py-1.5 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
                  Hi, good morning!
                  <br />
                  hope you doing great things today
                </div>
              </div>
            </div>
          </div>
        </PhoneFrame>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-brand-green flex items-center justify-center shadow-xl"
        >
          <WhatsAppIcon className="w-9 h-9 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute -left-4 top-1/3 bg-gray-200 text-gray-700 text-[11px] px-3 py-2 rounded-2xl rounded-bl-sm shadow-md max-w-[120px]"
        >
          Hi, God bless you!
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -right-10 top-1/2 bg-gray-100 text-gray-700 text-[11px] px-3 py-2 rounded-2xl rounded-br-sm shadow-md max-w-[140px]"
        >
          Thank you so much!
        </motion.div>
      </motion.div>
    </div>
  );
}
