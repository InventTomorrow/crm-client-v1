"use client";
import { Alert, AlertDescription } from "@/shared/ui/Alert";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
  ArrowLeft,
  Ban,
  Check,
  ClipboardList,
  Info,
  MessageCircle,
  Pencil,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClinicalServicePreview } from "../hooks/useClinicalServices";
import {
  CONDITIONAL_INTAKE_FIELDS,
  CORE_INTAKE_FIELDS,
  SERVICE_TYPE_LABELS,
} from "../types";

function Panel({
  title,
  description,
  children,
}: Readonly<{
  title: string;
  description?: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="card border p-5">
      <h2 className="text-[13.5px] font-semibold text-[var(--ink)]">{title}</h2>
      {description && (
        <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TickList({
  values,
  tone,
  empty,
}: Readonly<{ values: string[]; tone: "yes" | "no"; empty: string }>) {
  if (values.length === 0) {
    return <p className="text-muted-foreground text-sm italic">{empty}</p>;
  }

  const Icon = tone === "yes" ? Check : Ban;

  return (
    <ul className="grid gap-1.5 sm:grid-cols-2">
      {values.map((value) => (
        <li key={value} className="flex items-start gap-2 text-sm">
          <Icon
            className={
              tone === "yes"
                ? "mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                : "mt-0.5 size-3.5 shrink-0 text-rose-600 dark:text-rose-400"
            }
          />
          <span>{value}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A service as the assistant sees it.
 *
 * Every value here is rendered by the server using the same formatters the AI
 * tools call, so this is not a second opinion about what the bot will say — it
 * is the thing itself. That is the whole reason the page exists: a clinic can
 * read its own configuration back as behaviour instead of as form fields.
 */
export function ClinicalServiceDetailView({
  serviceId,
}: Readonly<{ serviceId: string }>) {
  const router = useRouter();
  const { data: preview, isLoading, isError } = useClinicalServicePreview(serviceId);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !preview) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <Alert variant="destructive">
          <AlertDescription>
            That service could not be loaded. It may have been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { summary, pricing, shiftOptions } = preview;
  const askedFields = CONDITIONAL_INTAKE_FIELDS.filter((field) =>
    preview.intakeFieldKeys.includes(field.key),
  );

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to services"
            onClick={() => router.push("/clinical-services")}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-semibold text-[var(--ink)]">
              {summary.name}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              {SERVICE_TYPE_LABELS[summary.serviceType]}
              {summary.category ? ` · ${summary.category}` : ""}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/clinical-services/${serviceId}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant={preview.isActive ? "secondary" : "outline"}>
            {preview.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={preview.isPubliclyListed ? "secondary" : "outline"}>
            {preview.isPubliclyListed ? "Listed" : "On enquiry only"}
          </Badge>
          {summary.requiresPractitioner && (
            <Badge variant="outline">Needs a named practitioner</Badge>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Alert>
            <Info className="size-4" />
            <AlertDescription>
              This is what the assistant works from — priced, worded and limited
              exactly as it will be in a conversation.
            </AlertDescription>
          </Alert>

          <Panel
            title="What it quotes"
            description="The only price the assistant may name for this service."
          >
            <p className="text-[15px] font-semibold text-[var(--ink)]">
              {pricing.display}
            </p>
            {pricing.note && (
              <p className="text-muted-foreground mt-1 text-sm">
                {pricing.note}
              </p>
            )}
            {!pricing.quotable && (
              <p className="mt-2 flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
                No figure reaches the patient — the assistant always hands this
                to a coordinator to quote.
              </p>
            )}

            {shiftOptions.length > 0 && (
              <div className="mt-4 space-y-2">
                {shiftOptions.map((shift) => (
                  <div
                    key={shift.key}
                    className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <span className="font-medium">
                      {shift.label}
                      {shift.hoursPerDay != null && (
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          · {shift.hoursPerDay}h/day
                        </span>
                      )}
                    </span>
                    <span>{shift.price}</span>
                    {shift.availableCities.length > 0 && (
                      <span className="text-muted-foreground w-full text-xs">
                        Only in {shift.availableCities.join(", ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="What it will and will not agree to"
            description="Every scope answer comes from these lists and nothing else."
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-medium">Includes</p>
                <TickList
                  values={preview.includedActivities}
                  tone="yes"
                  empty="Nothing listed — the assistant cannot confirm what this covers."
                />
              </div>
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium">Refuses</p>
                <TickList
                  values={preview.excludedActivities}
                  tone="no"
                  empty="Nothing listed."
                />
              </div>
            </div>
          </Panel>

          <Panel
            title="What it asks the family"
            description="Collected before the case reaches a coordinator."
          >
            <ol className="space-y-1.5">
              {CORE_INTAKE_FIELDS.map((field) => (
                <li key={field.key} className="flex items-start gap-2 text-sm">
                  <MessageCircle className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
                  <span>{field.question}</span>
                </li>
              ))}
              {askedFields.map((field) => (
                <li key={field.key} className="flex items-start gap-2 text-sm">
                  <ClipboardList className="text-primary mt-0.5 size-3.5 shrink-0" />
                  <span>{field.question}</span>
                </li>
              ))}
            </ol>
            {askedFields.length === 0 && (
              <p className="text-muted-foreground mt-3 text-xs">
                No extra questions configured for this service.
              </p>
            )}
          </Panel>

          {preview.safetyNote && (
            <Panel
              title="Always said"
              description="Attached to every answer about this service."
            >
              <p className="text-sm">{preview.safetyNote}</p>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
