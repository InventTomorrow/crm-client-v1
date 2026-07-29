"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  FileText,
  Trash2,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";
import Logo from "@/features/landing/components/Logo";
import Container from "@/features/landing/components/Container";

export interface LegalSection {
  id: string;
  title: string;
  icon?: any;
  summary?: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  isWarning?: boolean;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated: string;
  activeTab: "privacy" | "terms" | "deletion";
  sections: LegalSection[];
  warningBanner?: React.ReactNode;
}

const TAB_NAVIGATION = [
  {
    id: "privacy",
    label: "Privacy Policy",
    href: "/privacy-policy",
    icon: Shield,
  },
  {
    id: "terms",
    label: "Terms of Service",
    href: "/terms",
    icon: FileText,
  },
  {
    id: "deletion",
    label: "Data Deletion",
    href: "/data-deletion",
    icon: Trash2,
  },
];

export default function LegalLayout({
  title,
  subtitle,
  badge,
  lastUpdated,
  activeTab,
  sections,
  warningBanner,
}: LegalLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    sections.forEach((sec) => {
      initial[sec.id] = sec.defaultOpen ?? true;
    });
    return initial;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    sections.forEach((sec) => (allOpen[sec.id] = true));
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    sections.forEach((sec) => (allClosed[sec.id] = false));
    setOpenSections(allClosed);
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary?.toLowerCase().includes(q) ||
        sec.id.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7FBF8] via-white to-[#F4F9F5] text-brand-dark flex flex-col font-sans">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-gray-100/80 shadow-xs">
        <Container>
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-brand-dark hover:text-brand-green transition-colors group"
                aria-label="Return to Home"
              >
                <div className="w-9 h-9 rounded-full bg-brand-mint-soft flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <Logo />
              </Link>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-brand-mint-soft/60 p-1.5 rounded-full border border-gray-200/50">
              {TAB_NAVIGATION.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                        : "text-brand-dark/70 hover:text-brand-dark hover:bg-white/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-brand-dark hover:text-brand-green transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-white bg-brand-green rounded-full shadow-cta hover:bg-brand-green-hover transition-all hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Header Section */}
      <section className="relative py-12 md:py-16 overflow-hidden border-b border-gray-100 hero-bg">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-mint-soft text-brand-green text-xs font-bold border border-brand-green/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{badge}</span>
              <span className="w-1 h-1 rounded-full bg-brand-green/40" />
              <span className="text-brand-text font-medium">Last updated: {lastUpdated}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-dark tracking-tight leading-tight">
              {title}
            </h1>

            <p className="text-base sm:text-lg text-brand-text max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>

            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden items-center justify-center gap-2 pt-4">
              {TAB_NAVIGATION.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-brand-green text-white"
                        : "bg-white text-brand-dark/80 border border-gray-200"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content Layout */}
      <main className="flex-1 py-12">
        <Container>
          {warningBanner && (
            <div className="max-w-4xl mx-auto mb-10">
              {warningBanner}
            </div>
          )}

          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Quick Navigation & Search */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 bg-white p-6 rounded-2xl border border-gray-100 shadow-card space-y-6">
                {/* Search Box */}
                <div className="space-y-2">
                  <label htmlFor="search-input" className="text-xs font-bold text-brand-dark uppercase tracking-wider block">
                    Search Document
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search topics, keywords..."
                      className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                    />
                  </div>
                </div>

                {/* Section Index / Outline */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-brand-green" />
                      Table of Contents
                    </span>
                    <span className="text-[11px] font-semibold text-brand-text bg-brand-mint-soft px-2 py-0.5 rounded-full">
                      {filteredSections.length} Sections
                    </span>
                  </div>

                  <nav className="space-y-1 max-h-[340px] overflow-y-auto pr-1 text-xs">
                    {filteredSections.map((sec, idx) => {
                      const isOpen = !!openSections[sec.id];
                      return (
                        <a
                          key={sec.id}
                          href={`#${sec.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenSections((prev) => ({ ...prev, [sec.id]: true }));
                            const el = document.getElementById(sec.id);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className={`group flex items-center justify-between p-2.5 rounded-xl transition-all ${
                            isOpen
                              ? "bg-brand-mint-soft/80 text-brand-dark font-bold"
                              : "text-brand-text hover:bg-gray-50 hover:text-brand-dark"
                          }`}
                        >
                          <span className="truncate flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-white text-[11px] flex items-center justify-center font-mono border border-gray-200 shrink-0 text-brand-dark">
                              {idx + 1}
                            </span>
                            <span className="truncate">{sec.title}</span>
                          </span>
                          {sec.isWarning && (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                          )}
                        </a>
                      );
                    })}
                  </nav>
                </div>

                {/* Accordion Global Controls */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={expandAll}
                    className="flex-1 py-2 text-[11px] font-bold text-brand-green bg-brand-mint-soft hover:bg-brand-mint rounded-xl transition-colors text-center"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="flex-1 py-2 text-[11px] font-bold text-brand-text bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-center"
                  >
                    Collapse All
                  </button>
                </div>

                {/* Need Help Box */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-brand-dark to-[#0F302B] text-white space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <Shield className="w-4 h-4 text-brand-green" />
                    <span>Have Legal Questions?</span>
                  </div>
                  <p className="text-gray-300 text-[11px] leading-relaxed">
                    Our compliance team is here to assist with data privacy, compliance, and terms inquiry.
                  </p>
                  <a
                    href="mailto:support@asaanrabta.com"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-leaf hover:underline pt-1"
                  >
                    Contact Support →
                  </a>
                </div>
              </div>
            </aside>

            {/* Accordion Legal Sections Content */}
            <div className="lg:col-span-8 space-y-4">
              {filteredSections.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center space-y-3">
                  <Search className="w-8 h-8 text-gray-300 mx-auto" />
                  <h3 className="text-base font-bold text-brand-dark">No matching sections found</h3>
                  <p className="text-xs text-brand-text">Try searching for terms like &quot;WhatsApp&quot;, &quot;Data&quot;, &quot;Account&quot;, or &quot;Deletion&quot;.</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-brand-green hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              ) : (
                filteredSections.map((sec, idx) => {
                  const isOpen = !!openSections[sec.id];
                  const SectionIcon = sec.icon || FileText;

                  return (
                    <div
                      key={sec.id}
                      id={sec.id}
                      className={`scroll-mt-28 bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                        sec.isWarning
                          ? "border-amber-200 shadow-md shadow-amber-500/5"
                          : isOpen
                          ? "border-brand-green/30 shadow-card"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {/* Section Accordion Header */}
                      <button
                        onClick={() => toggleSection(sec.id)}
                        className={`w-full p-5 text-left flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                          sec.isWarning
                            ? "bg-amber-50/50 hover:bg-amber-50"
                            : isOpen
                            ? "bg-brand-mint-soft/40"
                            : "hover:bg-gray-50/70"
                        }`}
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              sec.isWarning
                                ? "bg-amber-100 text-amber-700"
                                : isOpen
                                ? "bg-brand-green text-white shadow-sm"
                                : "bg-brand-mint-soft text-brand-green"
                            }`}
                          >
                            <SectionIcon className="w-4 h-4" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-semibold text-brand-text">
                                {idx + 1}.0
                              </span>
                              <h2 className="text-base sm:text-lg font-bold text-brand-dark tracking-tight">
                                {sec.title}
                              </h2>
                              {sec.isWarning && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="w-3 h-3" /> Warning & Risk Alert
                                </span>
                              )}
                            </div>
                            {sec.summary && (
                              <p className="text-xs text-brand-text leading-relaxed">
                                {sec.summary}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-brand-dark shrink-0 mt-0.5">
                          {isOpen ? (
                            <ChevronUp className="w-4 h-4 text-brand-green" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Section Accordion Body */}
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 pt-2 border-t border-gray-100 text-xs sm:text-sm text-brand-text leading-relaxed space-y-4">
                              {sec.content}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold">
              <Link href="/" className="text-brand-text hover:text-brand-green transition-colors">
                Home
              </Link>
              <Link href="/privacy-policy" className="text-brand-text hover:text-brand-green transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-brand-text hover:text-brand-green transition-colors">
                Terms of Service
              </Link>
              <Link href="/data-deletion" className="text-brand-text hover:text-brand-green transition-colors">
                Data Deletion Instructions
              </Link>
              <Link href="/auth/login" className="text-brand-text hover:text-brand-green transition-colors">
                Login
              </Link>
            </nav>
          </div>
          <p className="mt-8 text-center text-brand-text text-xs">
            © 2026 AsaanRabta. All rights reserved. WhatsApp CRM & AI Automation.
          </p>
        </Container>
      </footer>
    </div>
  );
}
