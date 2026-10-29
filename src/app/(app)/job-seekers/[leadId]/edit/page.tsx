import type { Metadata } from "next";
import { JobSeekerFormView } from "@/features/job-seekers/components/JobSeekerFormView";

export const metadata: Metadata = {
  title: "Edit applicant | AsaanRabta",
  description: "Edit a job applicant and their CV",
};

export default async function EditJobSeekerPage({
  params,
}: {
  params: Promise<{ leadId: string }>;
}) {
  const { leadId } = await params;
  return (
    <div className="scroll h-full overflow-y-auto p-4 md:p-8">
      <JobSeekerFormView leadId={leadId} />
    </div>
  );
}
