import type { Metadata } from "next";
import { JobSeekersView } from "@/features/job-seekers/components/JobSeekersView";

export const metadata: Metadata = {
  title: "Job applicants | AsaanRabta",
  description:
    "People who asked about a job in chat, and what the assistant collected from them",
};

export default function JobSeekersPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <JobSeekersView />
    </div>
  );
}
