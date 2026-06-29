"use client";
import { motion } from "framer-motion";
import { DEMO_HIGHLIGHTS } from "../constants";
import { DemoPlayer } from "./DemoPlayer";

export function DemoView() {
  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[var(--ink)]">
          How to use the platform
        </h1>
        <p className="mt-1 text-[13.5px] text-[var(--ink-mute)]">
          Watch the walkthrough, then explore each area from the sidebar.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <DemoPlayer />
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DEMO_HIGHLIGHTS.map(({ Icon, title, body }) => (
          <div
            key={title}
            className="card flex items-start gap-3 p-4"
          >
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Icon size={18} />
            </span>
            <div>
              <div className="text-[13.5px] font-medium text-[var(--ink)]">
                {title}
              </div>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-[var(--ink-mute)]">
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
