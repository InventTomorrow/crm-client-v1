"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Logo from "../Logo";
import { Button } from "@/shared/ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-4 z-50 px-4">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`mx-auto max-w-[1180px] flex items-center justify-between px-6 py-3 rounded-full bg-white/95 backdrop-blur border border-gray-100 transition-shadow ${
          scrolled ? "shadow-nav" : ""
        }`}
      >
        <Logo />
        <div className="hidden md:flex items-center gap-9 text-[15px]">
          <a href="#features" className="text-brand-green font-semibold">
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-brand-dark/80 hover:text-brand-dark"
          >
            How it works
          </a>
          <a
            href="#who-its-for"
            className="text-brand-dark/80 hover:text-brand-dark"
          >
            Who it&apos;s for
          </a>
        </div>
        <Button className="h-auto rounded-full bg-brand-green px-6 py-3 text-[15px] font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
          Get Started
        </Button>
      </motion.nav>
    </div>
  );
}
