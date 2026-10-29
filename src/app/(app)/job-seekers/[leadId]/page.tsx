import type { Metadata } from "next";
import { JobSeekerDetailView } from "@/features/job-seekers/components/JobSeekerDetailView";

export const metadata: Metadata = {
  title: "Job applicant | AsaanRabta",
  description: "What a job applicant told the assistant, and the CV they sent",
};

export default async function JobSeekerDetailPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <JobSeekerDetailView leadId={leadId} />
    </div>
  );
}
