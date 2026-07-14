"use client";
import { DemoPlayer } from "@/features/demo/components/DemoPlayer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/Dialog";

export function WatchDemoModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[720px]">
        <DialogHeader className="border-b border-[var(--line)] px-6 py-4">
          <DialogTitle className="text-[17px] font-semibold">
            Watch Demo
          </DialogTitle>
        </DialogHeader>
        <DemoPlayer className="rounded-none border-0" autoPlay />
      </DialogContent>
    </Dialog>
  );
}
