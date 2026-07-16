"use client";

import { Button } from "@/shared/ui/Button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button variant="outline" onClick={() => router.back()}>
      <ArrowLeft size={14} />
      Go back
    </Button>
  );
}
