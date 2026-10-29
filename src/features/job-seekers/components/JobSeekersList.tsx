"use client";
import {
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Button } from "@/shared/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/DropdownMenu";
import { PermissionGuard } from "@/shared/ui/PermissionGuard";
import { SearchField } from "@/shared/ui/SearchField";
import { Skeleton } from "@/shared/ui/Skeleton";
import { useInfiniteJobSeekers } from "../hooks/useJobSeekers";
import type { JobSeeker } from "../types";
import { cvKindLabel } from "../utils/cv";
import { JobSeekerDeleteDialog } from "./JobSeekerDeleteDialog";

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

const actionLinkClass =
  "inline-flex items-center gap-1.5 border border-[var(--line)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--ink-soft)] no-underline transition-colors hover:bg-[var(--surface-2)]";

function ApplicantRow({
  jobSeeker,
  onEdit,
  onDelete,
}: {
  jobSeeker: JobSeeker;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { can } = usePermissions();
  const canEdit = can("leads:edit");
  const canDelete = can("leads:delete");
  const name = jobSeeker.name ?? "Unnamed applicant";
  const position = jobSeeker.details.find(
    (detail) => detail.key === "positionAppliedFor",
  )?.value;
  const extraDetails = jobSeeker.details.filter(
    (detail) =>
      !["fullName", "positionAppliedFor", "city"].includes(detail.key),
  );

  return (
    <li className="card flex flex-col gap-3 rounded-none border-l-2 border-l-[var(--accent)] p-4 md:flex-row md:items-start md:justify-between">
      <div className="flex min-w-0 gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center bg-[var(--surface-2)] text-[13px] font-semibold text-[var(--accent)]"
        >
          {name.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={`/job-seekers/${jobSeeker.leadId}`}
              className="text-[13.5px] font-semibold text-[var(--ink)] no-underline hover:text-[var(--accent)]"
            >
              {name}
            </Link>
            {position && (
              <span className="bg-[var(--accent-soft)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                {position}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-[var(--ink-mute)]">
            {[jobSeeker.phone, jobSeeker.city].filter(Boolean).join(" · ") ||
              "No contact details"}{" "}
            · Last activity {dateTime.format(new Date(jobSeeker.updatedAt))}
          </p>
          {extraDetails.length > 0 && (
            <dl className="mt-0.5 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              {extraDetails.map((detail) => (
                <div key={detail.key} className="flex flex-col">
                  <dt className="text-[11px] text-[var(--ink-mute)]">
                    {detail.label}
                  </dt>
                  <dd className="break-words text-[12.5px] text-[var(--ink-soft)]">
                    {detail.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {jobSeeker.details.length === 0 && (
            <p className="text-[12px] text-[var(--ink-mute)]">
              No details collected yet.
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {jobSeeker.cv ? (
          <a
            href={jobSeeker.cv.url}
            target="_blank"
            rel="noopener noreferrer"
            title={jobSeeker.cv.fileName ?? "CV"}
            className={actionLinkClass}
          >
            <FileText size={13} className="text-[var(--accent)]" /> CV ·{" "}
            {cvKindLabel(jobSeeker.cv)}
          </a>
        ) : (
          <span className="px-1 text-[11.5px] text-[var(--ink-mute)]">
            No CV yet
          </span>
        )}
        <Link
          href={`/job-seekers/${jobSeeker.leadId}`}
          className={actionLinkClass}
        >
          <Eye size={13} /> View
        </Link>
        <Link
          href={`/inbox?lead=${jobSeeker.leadId}`}
          className={actionLinkClass}
        >
          <MessageSquare size={13} /> Chat
        </Link>
        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                aria-label={`Actions for ${name}`}
                className="rounded-none"
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil size={13} className="mr-2" /> Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 size={13} className="mr-2" /> Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </li>
  );
}

/** Everyone who asked about a job in chat, with the details the assistant collected from them. */
export function JobSeekersList() {
  const [searchText, setSearchText] = useState("");
  const search = useDebouncedValue(searchText.trim());
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInfiniteJobSeekers(search);
  const jobSeekers = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const router = useRouter();
  const [applicantPendingDeletion, setApplicantPendingDeletion] =
    useState<JobSeeker | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <SearchField
          value={searchText}
          onValueChange={setSearchText}
          placeholder="Search by name, phone or city"
        />
        <div className="flex items-center gap-3">
          {total > 0 && (
            <span className="text-[12px] text-[var(--ink-mute)]">
              {total} total
            </span>
          )}
          <PermissionGuard permission="leads:create">
            <Button
              type="button"
              size="lg"
              onClick={() => router.push("/job-seekers/new")}
            >
              <Plus size={14} className="mr-1.5" /> Add applicant
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {isLoading ? (
        <ul className="flex flex-col gap-2" aria-busy="true">
          {Array.from({ length: 4 }, (_, index) => (
            <li
              key={index}
              className="card flex items-start gap-3 rounded-none p-4"
            >
              <Skeleton className="size-9 rounded-none" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-48 rounded-none" />
                <Skeleton className="h-3 w-72 max-w-full rounded-none" />
                <Skeleton className="h-3 w-40 rounded-none" />
              </div>
              <Skeleton className="h-9 w-28 rounded-none" />
            </li>
          ))}
        </ul>
      ) : jobSeekers.length === 0 ? (
        <div className="card rounded-none p-8 text-center text-[12.5px] text-[var(--ink-mute)]">
          {search
            ? "No applicants match that search."
            : "No one has asked about a job yet."}
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {jobSeekers.map((jobSeeker) => (
            <ApplicantRow
              key={jobSeeker.leadId}
              jobSeeker={jobSeeker}
              onEdit={() =>
                router.push(`/job-seekers/${jobSeeker.leadId}/edit`)
              }
              onDelete={() => setApplicantPendingDeletion(jobSeeker)}
            />
          ))}
        </ul>
      )}

      {hasNextPage && (
        <Button
          type="button"
          variant="outline"
          className="self-center"
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? (
            <Loader2 size={13} className="animate-spin" />
          ) : null}
          Load more
        </Button>
      )}

      <JobSeekerDeleteDialog
        jobSeeker={applicantPendingDeletion}
        onClose={() => setApplicantPendingDeletion(null)}
      />
    </div>
  );
}
