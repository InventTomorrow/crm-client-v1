"use client";
import { useMe } from "@/features/auth/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading, error } = useMe();

  useEffect(() => {
    if (!isLoading && (error || !user)) {
      router.replace("/auth/login");
    }
    console.log("user", user);
    console.log("isLoading", isLoading);
    console.log("error", error);
  }, [isLoading, error, user, router]);

  console.log("user", user);
  console.log("isLoading", isLoading);
  console.log("error", error);
  if (isLoading || error || !user) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return <>{children}</>;
}
