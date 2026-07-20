import type { Metadata } from "next";
import { DemoView } from "@/features/demo/components/DemoView";

export const metadata: Metadata = {
  title: "Demo",
  description: "A walkthrough of how to use the platform",
};

export default function DemoPage() {
  return (
    <div className="p-4 md:p-8">
      <DemoView />
    </div>
  );
}
