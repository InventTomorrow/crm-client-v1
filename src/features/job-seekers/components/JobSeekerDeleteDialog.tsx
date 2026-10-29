"use client";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useDeleteJobSeeker } from "../hooks/useJobSeekers";
import type { JobSeeker } from "../types";

interface JobSeekerDeleteDialogProps {
  jobSeeker: JobSeeker | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export function JobSeekerDeleteDialog({
  jobSeeker,
  onClose,
  onDeleted,
}: JobSeekerDeleteDialogProps) {
  const { mutate: deleteApplicant, isPending } = useDeleteJobSeeker();

  return (
    <ConfirmDialog
      open={jobSeeker !== null}
      onClose={onClose}
      loading={isPending}
      title="Delete this applicant?"
      description={`${jobSeeker?.name ?? "This applicant"} is removed from this list. The chat history stays in the inbox, and a new message from them brings them back.`}
      confirmLabel="Delete"
      onConfirm={() => {
        if (!jobSeeker) return;
        deleteApplicant(jobSeeker.leadId, { onSuccess: onDeleted });
        if (!onDeleted) onClose();
      }}
    />
  );
}
