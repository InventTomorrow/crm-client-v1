"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_HIGHLIGHTS, SHOW_DEMO_FLAG } from "../constants";
import { DemoPlayer } from "./DemoPlayer";
import { Button } from "@/shared/ui/Button";

/**
 * Shown once, right after onboarding sets SHOW_DEMO_FLAG. Mounted at the app
 * layout level so it appears on the first dashboard load.
 */
export function WelcomeDemoDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem(SHOW_DEMO_FLAG) === "1"
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.removeItem(SHOW_DEMO_FLAG);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent
        className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-[620px]"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-[var(--line)] px-6 py-4">
          <DialogTitle className="text-[17px] font-semibold">
            Welcome to your workspace
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[12.5px] text-[var(--ink-mute)]">
            Here&apos;s a quick tour of what you can do.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col gap-4 p-6"
        >
          <DemoPlayer />

          <div className="grid grid-cols-2 gap-2.5">
            {DEMO_HIGHLIGHTS.map(({ Icon, title }) => (
              <div
                key={title}
                className="flex items-center gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={15} />
                </span>
                <span className="text-[12.5px] font-medium text-[var(--ink)]">
                  {title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-end gap-2 border-t border-[var(--line)] px-6 py-4">
          <Button variant="outline" onClick={dismiss}>
            Skip
          </Button>
          <Button
            onClick={() => {
              dismiss();
              router.push("/demo");
            }}
          >
            View full demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
