'use client';
import { Alert, AlertDescription } from '@/shared/ui/Alert';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import {
  ArrowLeft,
  CalendarCheck,
  EyeOff,
  Image as ImageIcon,
  Info,
  Pencil,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  usePractitioner,
  usePractitionerPreview,
} from '../hooks/usePractitioners';
import { practitionerDisplayName, VISIBILITY_META } from '../types';

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

/**
 * A practitioner as the assistant resolves them.
 *
 * The point of the page is the gap between the stored setting and the effective
 * one: a doctor saved as "Profile & booking" under a clinic set to "Don't show"
 * is hidden, and the form field on the edit screen cannot say so on its own.
 */
export function PractitionerDetailView({
  practitionerId,
}: Readonly<{ practitionerId: string }>) {
  const router = useRouter();
  const practitionerQuery = usePractitioner(practitionerId);
  const previewQuery = usePractitionerPreview(practitionerId);

  const practitioner = practitionerQuery.data;
  const preview = previewQuery.data;

  if (practitionerQuery.isLoading || previewQuery.isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4 md:p-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!practitioner || !preview) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <Alert variant="destructive">
          <AlertDescription>
            That practitioner could not be loaded. They may have been removed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isClampedByClinic =
    preview.overrideVisibility !== null &&
    preview.overrideVisibility !== preview.effectiveVisibility;

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Back to practitioners"
            onClick={() => router.push('/practitioners')}
          >
            <ArrowLeft size={16} />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-semibold text-[var(--ink)]">
              {practitionerDisplayName(practitioner)}
            </h1>
            <p className="text-[12px] text-[var(--ink-mute)]">
              {practitioner.designation ?? 'Practitioner'}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/practitioners/${practitionerId}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {/* The headline answer, stated as behaviour rather than as a setting. */}
          {!preview.mentionable ? (
            <Alert>
              <EyeOff className="size-4" />
              <AlertDescription>
                The assistant never mentions this practitioner. Enquiries that
                name them go to a coordinator.
                {isClampedByClinic && (
                  <>
                    {' '}
                    This is the clinic-wide setting (
                    {VISIBILITY_META[preview.workspaceVisibility].label})
                    overriding their own — change it in{' '}
                    <Link
                      href="/bookings/availability"
                      className="text-primary underline"
                    >
                      booking settings
                    </Link>
                    .
                  </>
                )}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Info className="size-4" />
              <AlertDescription>
                {preview.bookable
                  ? 'The assistant may show this profile and book against their own calendar.'
                  : 'The assistant may show this profile, but never offers a time — a coordinator arranges the appointment.'}
              </AlertDescription>
            </Alert>
          )}

          <Panel
            title="How visibility resolves"
            description="A practitioner may be set narrower than the clinic, never wider."
          >
            <dl className="grid gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground text-xs">Clinic-wide</dt>
                <dd className="text-sm font-medium">
                  {VISIBILITY_META[preview.workspaceVisibility].label}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">This person</dt>
                <dd className="text-sm font-medium">
                  {preview.overrideVisibility
                    ? VISIBILITY_META[preview.overrideVisibility].label
                    : 'Uses the clinic setting'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">In effect</dt>
                <dd className="text-sm font-medium">
                  {VISIBILITY_META[preview.effectiveVisibility].label}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={practitioner.isActive ? 'secondary' : 'outline'}>
                {practitioner.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {preview.bookable && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <CalendarCheck className="size-3" />
                  Bookable
                </Badge>
              )}
              {!practitioner.isActive && (
                <span className="text-muted-foreground text-xs">
                  Inactive practitioners keep their history but are never
                  offered, whatever the visibility says.
                </span>
              )}
            </div>
          </Panel>

          <Panel
            title="What patients see"
            description={
              preview.hasPhoto
                ? 'Sent as their photo, with this line captioned underneath.'
                : 'Sent as text. Add a photo and the profile goes out as a picture instead.'
            }
          >
            <div className="flex items-start gap-3 rounded-lg border p-3">
              {preview.hasPhoto && practitioner.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={practitioner.photoUrl}
                  alt=""
                  className="size-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-lg">
                  {preview.hasPhoto ? (
                    <ImageIcon className="text-muted-foreground size-5" />
                  ) : (
                    <UserRound className="text-muted-foreground size-5" />
                  )}
                </span>
              )}
              <p className="text-sm">{preview.caption}</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
