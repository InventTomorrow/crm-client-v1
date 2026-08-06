'use client';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { PreviewDetailRow, PreviewEmptyHint, PreviewPanel } from '@/shared/ui/PreviewPanel';
import { Skeleton } from '@/shared/ui/Skeleton';
import { StatCard } from '@/shared/ui/StatCard';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Columns3,
  ExternalLink,
  FileText,
  Info,
  LayoutList,
  Layers,
  MonitorSmartphone,
  MoreVertical,
  Pencil,
  Star,
  Target,
  Trash2,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeleteServiceOffering, useServiceOffering } from '../hooks/useServices';
import {
  countHighlightedPlans,
  formatServiceDate,
  formatServiceDeliveryType,
  formatServicePriceCadence,
  formatServicePricingType,
  formatServiceStartingPrice,
  toPlanPreviewList,
} from '../utils/servicePreviewSummary';
import { PlanComparisonSheet } from './PlanComparisonSheet';
import { PlanPreviewCard } from './PlanPreviewCard';

/** Read-only view of one service offering — how the catalog entry reads before anyone edits it.
 * Clicking a service in the list lands here; the editor is one action away. */
export function ServicePreviewView({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const { data: service, isLoading, isError } = useServiceOffering(serviceId);
  const deleteService = useDeleteServiceOffering();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const returnToList = () => router.push('/services');
  const goToEditor = () => router.push(`/services/${serviceId}/edit`);

  function handleDeleteConfirm() {
    deleteService.mutate(serviceId, { onSuccess: returnToList });
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 p-4 md:p-8">
        <Button variant="outline" size="lg" onClick={returnToList} className="w-fit">
          <ArrowLeft size={14} className="mr-1.5" /> Back to services
        </Button>
        <p className="py-12 text-center text-sm text-destructive">
          This service could not be loaded. It may have been deleted.
        </p>
      </div>
    );
  }

  const plans = toPlanPreviewList(service);
  const highlightedCount = countHighlightedPlans(service);
  const priceCadence = formatServicePriceCadence(service);
  const keyOutcomes = service.keyOutcomes.filter(Boolean);
  const platforms = service.platformsCovered.filter(Boolean);

  return (
    <div className="scroll h-full overflow-y-auto">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 p-4 md:p-8">
        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              aria-label="Back to services"
              onClick={returnToList}
            >
              <ArrowLeft size={16} />
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[18px] font-semibold text-[var(--ink)]">{service.name}</h1>
                <Badge
                  variant={service.isActive ? 'default' : 'secondary'}
                  className="text-[10px]"
                >
                  {service.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {service.category && (
                  <Badge variant="outline" className="text-[10px]">
                    {service.category}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-[12px] text-[var(--ink-mute)]">
                Services catalog · updated {formatServiceDate(service.updatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {plans.length > 1 && (
              <Button variant="outline" size="lg" onClick={() => setIsComparisonOpen(true)}>
                <Columns3 size={14} className="mr-1.5" /> Compare plans
              </Button>
            )}
            <Button size="lg" onClick={goToEditor}>
              <Pencil size={14} className="mr-1.5" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label={`More actions for ${service.name}`}>
                  <MoreVertical size={15} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/services/plans')}>
                  <LayoutList size={13} className="mr-2" /> Plans &amp; pricing
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                >
                  <Trash2 size={13} className="mr-2" /> Delete service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Headline numbers */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Starting at"
            value={formatServiceStartingPrice(service)}
            hint={priceCadence ?? 'Priced in conversation'}
            Icon={Banknote}
          />
          <StatCard
            label="Delivery"
            value={formatServiceDeliveryType(service)}
            Icon={Truck}
          />
          <StatCard
            label="Pricing"
            value={formatServicePricingType(service)}
            Icon={Layers}
          />
          <StatCard
            label="Plans"
            value={plans.length}
            hint={highlightedCount > 0 ? `${highlightedCount} recommended` : undefined}
            Icon={LayoutList}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div className="flex min-w-0 flex-col gap-5">
            <PreviewPanel
              Icon={FileText}
              title="How it's pitched"
              description="The lines the bot leads with when a lead asks about this service."
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
                  Short description
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink)]">
                  {service.shortDescription}
                </p>
              </div>

              <div className="h-px bg-[var(--line)]" />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-mute)]">
                  Full description
                </p>
                {service.fullDescription?.trim() ? (
                  <p className="mt-1.5 whitespace-pre-line text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                    {service.fullDescription}
                  </p>
                ) : (
                  <div className="mt-1.5">
                    <PreviewEmptyHint>
                      Nothing written yet — the bot answers detailed questions from the short
                      description alone.
                    </PreviewEmptyHint>
                  </div>
                )}
              </div>
            </PreviewPanel>

            <PreviewPanel
              Icon={Target}
              title="Key outcomes"
              description="What the bot promises this service delivers."
              action={
                keyOutcomes.length > 0 && (
                  <span className="text-[11px] text-[var(--ink-mute)]">
                    {keyOutcomes.length} listed
                  </span>
                )
              }
            >
              {keyOutcomes.length === 0 ? (
                <PreviewEmptyHint>
                  No outcomes listed — the bot has nothing to lean on when a lead compares options.
                </PreviewEmptyHint>
              ) : (
                <ul className="flex flex-col gap-2">
                  {keyOutcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]"
                    >
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                      <span className="min-w-0">{outcome}</span>
                    </li>
                  ))}
                </ul>
              )}
            </PreviewPanel>

            <PreviewPanel
              Icon={LayoutList}
              title="Plans"
              description="Every tier in the order the bot leads with them."
              action={
                plans.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => setIsComparisonOpen(true)}>
                    <Columns3 size={13} className="mr-1" /> Compare
                  </Button>
                )
              }
            >
              {plans.length === 0 ? (
                <PreviewEmptyHint>
                  {service.pricingType === 'TIERED'
                    ? 'Tiered pricing with no plans — the bot has no tiers to quote.'
                    : 'No plans — this service is quoted from its starting price.'}
                </PreviewEmptyHint>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {plans.map((plan, index) => (
                    <PlanPreviewCard
                      key={plan.key}
                      plan={plan}
                      index={index}
                      currency={service.currency}
                    />
                  ))}
                </div>
              )}
            </PreviewPanel>
          </div>

          {/* Aside — the facts a rep checks rather than reads */}
          <div className="flex min-w-0 flex-col gap-5">
            <PreviewPanel
              Icon={MonitorSmartphone}
              title="Platforms covered"
              description="Where the work is actually delivered."
            >
              {platforms.length === 0 ? (
                <PreviewEmptyHint>Not specified.</PreviewEmptyHint>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((platform) => (
                    <Badge key={platform} variant="secondary" className="text-[10.5px]">
                      {platform}
                    </Badge>
                  ))}
                </div>
              )}
            </PreviewPanel>

            <PreviewPanel Icon={Info} title="Details">
              <div className="flex flex-col gap-2.5">
                <PreviewDetailRow
                  label="Status"
                  value={service.isActive ? 'Active' : 'Inactive'}
                />
                <PreviewDetailRow label="Category" value={service.category || '—'} />
                <PreviewDetailRow label="Currency" value={service.currency} />
                <PreviewDetailRow label="List order" value={service.displayOrder} />
                <PreviewDetailRow
                  label="Recommended tier"
                  value={
                    highlightedCount > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Star size={10} className="text-[var(--accent)]" fill="currentColor" />
                        {highlightedCount}
                      </span>
                    ) : (
                      'None'
                    )
                  }
                />
                <PreviewDetailRow label="Created" value={formatServiceDate(service.createdAt)} />
                <PreviewDetailRow label="Updated" value={formatServiceDate(service.updatedAt)} />
              </div>

              {service.sampleWorkUrl && (
                <>
                  <div className="h-px bg-[var(--line)]" />
                  <a
                    href={service.sampleWorkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)] hover:underline"
                  >
                    <ExternalLink size={12} /> View sample work
                  </a>
                </>
              )}
            </PreviewPanel>
          </div>
        </div>
      </div>

      <PlanComparisonSheet
        plans={plans}
        currency={service.currency}
        open={isComparisonOpen}
        onOpenChange={setIsComparisonOpen}
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete service?"
        description="This will remove the service offering and its RAG vector. The action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleteService.isPending}
      />
    </div>
  );
}
