"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PrimaryCta } from "../LandingCta";
import Logo from "../Logo";

// Root-relative so the same nav works from /blog, where the sections do not exist.
const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#who-its-for", label: "Who it's for" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#faq", label: "FAQ" },
];

/** Section id a hash link targets, or null for a plain route link. */
const sectionIdOf = (href: string) => href.split("#")[1] ?? null;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState(
    sectionIdOf(NAV_LINKS[0].href) ?? "",
  );
  const navRef = useRef<HTMLDivElement>(null);
  const isBlogRoute = pathname.startsWith("/blog");

  const isLinkActive = (href: string) => {
    const sectionId = sectionIdOf(href);
    if (!sectionId) return pathname.startsWith(href);
    return !isBlogRoute && sectionId === activeId;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy — highlight the nav link whose section is in view.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) => {
      const sectionId = sectionIdOf(link.href);
      return sectionId ? document.getElementById(sectionId) : null;
    }).filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },

      // Thin band near the top-center so the section crossing it becomes active.
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="sticky top-3 sm:top-4 z-50 px-3 sm:px-4">
      <div ref={navRef} className="relative mx-auto max-w-[1392px]">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-gray-100 bg-white/80 backdrop-blur-md transition-shadow ${
            scrolled || menuOpen ? "shadow-nav" : ""
          }`}
        >
          <Link href={"/"}>
            <Logo />
          </Link>

          <div className="hidden lg:flex items-center gap-9 text-[15px]">
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "true" : undefined}
                  className={`relative py-1 transition-colors duration-300 ease-out ${
                    active
                      ? "text-brand-green font-semibold"
                      : "text-brand-dark/80 hover:text-brand-dark"
                  }`}
                >
                  {link.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-brand-green"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <PrimaryCta className="hidden lg:inline-flex h-auto rounded-full bg-brand-green px-6 py-3 text-[15px] font-semibold text-white shadow-cta transition-all hover:-translate-y-0.5 hover:bg-brand-green-hover hover:shadow-cta-hover">
              Get Started
            </PrimaryCta>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-brand-dark transition-colors hover:bg-brand-mint-soft active:scale-95"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.nav>

        {/* Mobile menu — absolutely positioned so it overlays content instead of pushing it. */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden absolute left-0 right-0 top-full mt-2 z-20 origin-top rounded-3xl border border-gray-100 bg-white/95 backdrop-blur-md shadow-nav overflow-hidden"
            >
              <div className="flex flex-col p-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={
                        isLinkActive(link.href) ? "true" : undefined
                      }
                      className={`relative block px-4 py-3 rounded-2xl text-[15px] font-medium transition-colors duration-300 active:scale-[0.98] ${
                        isLinkActive(link.href)
                          ? "text-brand-green"
                          : "text-brand-dark/90 hover:text-brand-dark hover:bg-brand-mint-soft"
                      }`}
                    >
                      {isLinkActive(link.href) && (
                        <motion.span
                          layoutId="mobile-nav-active"
                          className="absolute inset-0 rounded-2xl bg-brand-mint-soft"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative">{link.label}</span>
                    </Link>
                  </motion.div>
                ))}
                <div className="p-2 pt-1">
                  <PrimaryCta className="w-full justify-center h-auto rounded-full bg-brand-green px-6 py-3 text-[15px] font-semibold text-white shadow-cta transition-all hover:bg-brand-green-hover">
                    Get Started
                  </PrimaryCta>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
