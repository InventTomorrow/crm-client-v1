"use client";
import { cn } from "@/lib/utils";
import { Landmark, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import type { PaymentAccountForm } from "../../types";

const METHOD_ICONS: Record<PaymentAccountForm["method"], LucideIcon> = {
  BANK_TRANSFER: Landmark,
  EASYPAISA: Smartphone,
  JAZZCASH: Smartphone,
  OTHER: Wallet,
};

export function PaymentMethodIcon({
  method,
  className,
}: {
  method: PaymentAccountForm["method"];
  className?: string;
}) {
  const Icon = METHOD_ICONS[method];
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]",
        className,
      )}
    >
      <Icon size={17} />
    </span>
  );
}
