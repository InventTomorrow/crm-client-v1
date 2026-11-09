import type { Metadata } from "next";
import { JobSeekerFormView } from "@/features/job-seekers/components/JobSeekerFormView";

export const metadata: Metadata = {
  title: "Add applicant | AsaanRabta",
  description: "Add a job applicant by hand",
};

export default function NewJobSeekerPage() {
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <JobSeekerFormView />
    </div>
  );
}
