'use client';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdfPreviewProps {
  /** Already-resolved URL (proxied S3 URL or local object URL). */
  src: string | undefined;
  title: string;
  /** Enables scrolling/zooming — for full-size viewers; thumbnails stay inert so overlay buttons keep working. */
  interactive?: boolean;
  className?: string;
}

/** Inline first-page preview of a PDF via the browser's native viewer, with an icon fallback. */
export function PdfPreview({ src, title, interactive = false, className }: PdfPreviewProps) {
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

  return (
    <div className={cn('relative overflow-hidden bg-[var(--surface-2)]', className)}>
      <iframe
        // view=Fit is Chrome's whole-page fit, zoom=page-fit is Firefox's — each ignores the other's param.
        src={`${src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&zoom=page-fit`}
        title={title}
        loading="lazy"
        className={cn(
          // The viewer's own scrollbar can't be styled cross-origin, so it is
          // cropped by oversizing the iframe; wheel scrolling still works.
          'absolute border-0',
          interactive
            ? 'inset-y-0 left-0 w-[calc(100%+18px)]'
            : // Thumbnails render at 4× and scale down, shrinking the viewer's
              // scrollbar and dark page margins so small tiles stay legible.
              'pointer-events-none -top-2 -left-2 h-[calc(400%+64px)] w-[calc(400%+80px)] origin-top-left scale-[0.25]',
        )}
      />
    </div>
  );
}
