'use client';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfPreviewProps {
  /** Already-resolved URL (proxied S3 URL or local object URL). */
  src: string | undefined;
  title: string;
  /** Enables scrolling/zooming — for full-size viewers; thumbnails stay inert so overlay buttons keep working. */
  interactive?: boolean;
  /** 'cover' fills the box and crops the page, matching an image's object-cover. 'contain' shows the whole page letterboxed, matching object-contain. */
  fit?: 'cover' | 'contain';
  className?: string;
}

/** Inline first-page preview of a PDF via the browser's native viewer, with an icon fallback. */
export function PdfPreview({
  src,
  title,
  interactive = false,
  fit = 'contain',
  className,
}: PdfPreviewProps) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-[var(--surface-2)] text-[var(--ink-mute)]',
          className,
        )}
      >
        <FileText size={18} />
      </div>
    );
  }

  // view= is Chrome's open param, zoom= is Firefox's — each ignores the other's.
  // page-fit/Fit shows the whole page (contain); page-width/FitH fills the box's
  // width and lets height overflow so the box's own crop fills it (cover).
  const openParams =
    fit === 'cover' ? 'view=FitH&zoom=page-width' : 'view=Fit&zoom=page-fit';

  return (
    <div className={cn('relative overflow-hidden bg-[var(--surface-2)]', className)}>
      <iframe
        src={`${src}#toolbar=0&navpanes=0&scrollbar=0&${openParams}`}
        title={title}
        loading="lazy"
        className={cn(
          'absolute border-0',
          fit === 'cover'
            ? // Oversized and centered so any leftover mismatch between the page's
              // and box's aspect ratios crops out symmetrically instead of gapping.
              'pointer-events-none left-1/2 top-1/2 h-[300%] w-[300%] -translate-x-1/2 -translate-y-1/2'
            : interactive
              ? // The viewer's own scrollbar can't be styled cross-origin, so it's
                // cropped by widening the iframe past the box; wheel scroll still works.
                'inset-y-0 left-0 w-[calc(100%+18px)]'
              : 'pointer-events-none inset-0 size-full',
        )}
      />
    </div>
  );
}
