'use client';
import { getImageUrl, isPdfFile } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/DropdownMenu';
import { PdfPreview } from '@/shared/ui/PdfPreview';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { ExternalLink, FileText, MoreVertical, Pencil, Trash2, Users } from 'lucide-react';
import { RESOURCE_TYPE_LABELS, type TenantResource } from '../types';
import {
  describeConditions,
  describeFileKind,
  formatFileSize,
  isUnconditional,
} from '../utils/resourceFormat';

interface ResourceCardProps {
  resource: TenantResource;
  onEdit: (resource: TenantResource) => void;
  onDelete: (resource: TenantResource) => void;
}

export function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  const conditionLines = describeConditions(resource.conditions);

  return (
    <article className="card flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {isPdfFile(resource.mimeType, resource.fileUrl) ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--line)]">
              <PdfPreview
                src={getImageUrl(resource.fileUrl)}
                title={resource.label}
                fit="cover"
                className="absolute inset-0"
              />
            </span>
          ) : resource.mimeType.startsWith('image/') ? (
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface-2)]">
              <ShimmerImage
                src={getImageUrl(resource.fileUrl)}
                alt={resource.label}
                wrapperClassName="absolute inset-0"
                className="size-full object-cover"
              />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--surface-2)] text-[var(--accent)]">
              <FileText size={15} />
            </span>
          )}

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-[13px] font-medium text-[var(--ink)]">
                {resource.label}
              </p>
              <Badge variant="outline" className="text-[10px]">
                {RESOURCE_TYPE_LABELS[resource.resourceType]}
              </Badge>
              {!resource.isActive && (
                <Badge variant="secondary" className="text-[10px]">
                  Hidden
                </Badge>
              )}
            </div>

            <p className="mt-0.5 text-[11.5px] text-[var(--ink-mute)]">
              {describeFileKind(resource.mimeType)} · {formatFileSize(resource.sizeBytes)}
            </p>

            {resource.description && (
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">
                {resource.description}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(resource)}>
              <Pencil size={13} className="mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} className="mr-2" /> Open file
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(resource)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={13} className="mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-mute)]">
          <Users size={11} /> Shared with
        </p>
        {isUnconditional(resource) ? (
          <p className="mt-1 text-[11.5px] text-[var(--ink-soft)]">Every lead</p>
        ) : (
          <ul className="mt-1 flex flex-col gap-0.5">
            {conditionLines.map((line) => (
              <li key={line} className="text-[11.5px] text-[var(--ink-soft)]">
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
