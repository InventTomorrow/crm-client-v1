import { RegisterView } from "@/features/auth/components/RegisterView";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Create workspace",
  description: "Start selling smarter with AsaanRabta",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <RegisterView />
    </Suspense>
  );
}
