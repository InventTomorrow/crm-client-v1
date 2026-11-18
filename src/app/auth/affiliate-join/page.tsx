import { AffiliateJoinView } from "@/features/affiliate/components/join/AffiliateJoinView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Join the affiliate programme",
  description: "Set up your AsaanRabta affiliate account",
};

export default function AffiliateJoinPage() {
  return (
    <div className="mx-auto w-full max-w-[420px]">
      <Suspense>
        <AffiliateJoinView />
      </Suspense>
    </div>
  );
}
