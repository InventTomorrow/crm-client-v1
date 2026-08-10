'use client';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getImageUrl, isPdfFile } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { PdfPreview } from '@/shared/ui/PdfPreview';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { useMenuCards } from '../hooks/useMenuCards';

/**
 * Full-bleed viewer for the physical menu cards — the same images a customer is
 * sent on WhatsApp, shown the way they would hold them at a table. Read-only:
 * uploading and reordering happen on /menu/cards.
 */
export function MenuCardsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: menuCards = [], isLoading } = useMenuCards();
  const [activeIndex, setActiveIndex] = useState(0);

  const visibleCards = menuCards.filter((menuCard) => menuCard.isActive);
  const totalCards = visibleCards.length;

  const goToCard = useCallback(
    (index: number) => {
      if (totalCards === 0) return;
      setActiveIndex(((index % totalCards) + totalCards) % totalCards);
    },
    [totalCards],
  );

  useEffect(() => {
    if (!open || totalCards < 2) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goToCard(activeIndex + 1);
      if (event.key === 'ArrowLeft') goToCard(activeIndex - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, activeIndex, totalCards, goToCard]);

  const activeCard = visibleCards[activeIndex];

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Reopening always starts from the first card — done here rather than in
        // an effect so it cannot cascade an extra render.
        if (nextOpen) setActiveIndex(0);
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="flex h-[92dvh] max-w-[min(72rem,calc(100vw-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-[min(72rem,calc(100vw-3rem))]">
        <DialogHeader className="border-b border-[var(--border)] px-5 py-3.5 text-left">
          <DialogTitle className="flex items-center gap-2 text-[15px]">
            <BookOpen size={15} className="text-[var(--primary)]" />
            Menu cards
          </DialogTitle>
          <DialogDescription className="text-[12px]">
            {totalCards > 0
              ? `Card ${activeIndex + 1} of ${totalCards} — exactly what customers receive.`
              : 'What customers receive when they ask to see the menu.'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[var(--surface-2)] p-3 sm:p-6">
          {isLoading && (
            <p className="text-[12.5px] text-[var(--ink-mute)]">Loading menu cards…</p>
          )}

          {!isLoading && totalCards === 0 && (
            <div className="flex flex-col items-center gap-2 text-center text-[var(--ink-mute)]">
              <BookOpen size={22} />
              <p className="text-[13px]">No menu cards to show yet.</p>
            </div>
          )}

          {activeCard && (
            <>
              <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                {isPdfFile(activeCard.mimeType, activeCard.imageUrl) ? (
                  <PdfPreview
                    src={getImageUrl(activeCard.imageUrl)}
                    title={activeCard.title ?? `Menu card ${activeIndex + 1}`}
                    interactive
                    className="absolute inset-0"
                  />
                ) : (
                  <ShimmerImage
                    src={getImageUrl(activeCard.imageUrl)}
                    alt={activeCard.title ?? `Menu card ${activeIndex + 1}`}
                    wrapperClassName="absolute inset-0"
                    className="size-full object-contain"
                  />
                )}
              </div>

              {totalCards > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Previous card"
                    onClick={() => goToCard(activeIndex - 1)}
                    className="absolute left-4 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-md sm:left-8"
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Next card"
                    onClick={() => goToCard(activeIndex + 1)}
                    className="absolute right-4 top-1/2 size-10 -translate-y-1/2 rounded-full shadow-md sm:right-8"
                  >
                    <ChevronRight size={18} />
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        {totalCards > 1 && (
          <div className="scroll flex items-center gap-2 overflow-x-auto border-t border-[var(--border)] px-4 py-3">
            {visibleCards.map((menuCard, index) => (
              <button
                key={menuCard.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={menuCard.title ?? `Menu card ${index + 1}`}
                aria-current={index === activeIndex}
                className={cn(
                  'relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                  index === activeIndex
                    ? 'border-[var(--primary)]'
                    : 'border-transparent opacity-60 hover:opacity-100',
                )}
              >
                {isPdfFile(menuCard.mimeType, menuCard.imageUrl) ? (
                  <PdfPreview
                    src={getImageUrl(menuCard.imageUrl)}
                    title={menuCard.title ?? `Menu card ${index + 1}`}
                    className="absolute inset-0"
                  />
                ) : (
                  <ShimmerImage
                    src={getImageUrl(menuCard.imageUrl)}
                    alt=""
                    wrapperClassName="absolute inset-0"
                    className="size-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
