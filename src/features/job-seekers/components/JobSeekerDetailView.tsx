"use client";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  FileText,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useJobSeeker } from "../hooks/useJobSeekers";
import { cvKindLabel } from "../utils/cv";
import { JobSeekerDeleteDialog } from "./JobSeekerDeleteDialog";
import { JobSeekerFormDialog } from "./JobSeekerFormDialog";

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const sectionClass = "card flex flex-col gap-3 rounded-none p-4";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-l-2 border-[var(--accent)] pl-3 text-[13.5px] font-semibold text-[var(--ink)]">
      {children}
    </h2>
  );
}

/** One applicant: everything the assistant collected, their CV and a way back to the chat. */
export function JobSeekerDetailView({ leadId }: { leadId: string }) {
  const router = useRouter();
  const { data: jobSeeker, isLoading, isError } = useJobSeeker(leadId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const backLink = (
    <Link
      href="/job-seekers"
      className="inline-flex w-fit items-center gap-1.5 text-[12.5px] text-[var(--ink-mute)] no-underline hover:text-[var(--ink)]"
    >
      <ArrowLeft size={14} /> Job applicants
    </Link>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-4 w-32 rounded-none" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-none" />
          <Skeleton className="h-6 w-56 rounded-none" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-64 w-full rounded-none" />
          <Skeleton className="h-64 w-full rounded-none" />
        </div>
      </div>
    );
  }

  if (isError || !jobSeeker) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <div className="card rounded-none p-8 text-center text-[12.5px] text-[var(--ink-mute)]">
          This applicant could not be found.
        </div>
      </div>
    );
  }

  const name = jobSeeker.name ?? "Unnamed applicant";
  const position = jobSeeker.details.find(
    (detail) => detail.key === "positionAppliedFor",
  )?.value;

  return (
    <div className="flex flex-col gap-4">
      {backLink}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="flex size-12 shrink-0 items-center justify-center bg-[var(--surface-2)] text-[18px] font-semibold text-[var(--accent)]"
          >
            {name.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-[20px] font-semibold text-[var(--ink)]">
              {name}
            </h1>
            {position && (
              <span className="w-fit bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11.5px] font-medium text-[var(--accent)]">
                {position}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PermissionGuard permission="leads:edit">
            <Button
              type="button"
              variant="outline"
              size="xl"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="size-4" /> Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="leads:delete">
            <Button
              type="button"
              variant="outline"
              size="xl"
              className="text-destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          </PermissionGuard>
          {jobSeeker.conversationId && (
            <Button asChild size="xl">
              <Link href={`/inbox?lead=${jobSeeker.leadId}`}>
                <MessageSquare className="size-4" /> Open chat
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className={sectionClass}>
          <SectionTitle>Details collected</SectionTitle>
          {jobSeeker.details.length === 0 ? (
            <p className="text-[12.5px] text-[var(--ink-mute)]">
              The assistant has not collected any details yet.
            </p>
          ) : (
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {jobSeeker.details.map((detail) => (
                <div
                  key={detail.key}
                  className="flex flex-col gap-0.5 border-b border-[var(--line)] pb-2"
                >
                  <dt className="text-[11.5px] text-[var(--ink-mute)]">
                    {detail.label}
                  </dt>
                  <dd className="break-words text-[13px] text-[var(--ink)]">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section className={sectionClass}>
            <SectionTitle>CV</SectionTitle>
            {jobSeeker.cv ? (
              <>
                <div className="flex items-start gap-2.5">
                  <FileText
                    size={18}
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] text-[var(--ink)]">
                      {jobSeeker.cv.fileName ?? "CV"}
                    </p>
                    <p className="text-[11.5px] text-[var(--ink-mute)]">
                      {cvKindLabel(jobSeeker.cv)} · received{" "}
                      {dateTime.format(new Date(jobSeeker.cv.receivedAt))}
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" size="lg" className="w-fit">
                  <a
                    href={jobSeeker.cv.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="size-4" /> Open CV
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-[12.5px] text-[var(--ink-mute)]">
                No CV yet. It is saved here when they send one in chat.
              </p>
            )}
          </section>

          <section className={sectionClass}>
            <SectionTitle>Contact and activity</SectionTitle>
            <ul className="flex flex-col gap-2.5 text-[12.5px] text-[var(--ink-soft)]">
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[var(--ink-mute)]" />
                {jobSeeker.phone ?? "No phone number"}
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-[var(--ink-mute)]" />
                {jobSeeker.city ?? "No city"}
              </li>
              <li className="flex items-center gap-2">
                <Calendar size={14} className="text-[var(--ink-mute)]" />
                First contact {dateTime.format(new Date(jobSeeker.createdAt))}
              </li>
              <li className="flex items-center gap-2">
                <Calendar size={14} className="text-[var(--ink-mute)]" />
                Last activity {dateTime.format(new Date(jobSeeker.updatedAt))}
              </li>
            </ul>
          </section>
        </div>
      </div>

      <JobSeekerFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        jobSeeker={jobSeeker}
      />
      <JobSeekerDeleteDialog
        jobSeeker={isDeleteOpen ? jobSeeker : null}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={() => router.push("/job-seekers")}
      />
    </div>
  );
}
