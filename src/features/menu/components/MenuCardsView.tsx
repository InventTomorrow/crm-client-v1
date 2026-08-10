'use client';
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Trash2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, getImageUrl, isPdfFile } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Skeleton } from '@/shared/ui/Motion';
import { PdfPreview } from '@/shared/ui/PdfPreview';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { useMenuCardsView } from '../hooks/useMenuCardsView';
import { MenuCardsDialog } from './MenuCardsDialog';

const OVERLAY_ACTION_CLASS =
  'inline-flex size-8 items-center justify-center rounded-full bg-[var(--surface)]/90 text-[var(--ink)] shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--surface)] disabled:opacity-40';

export function MenuCardsView() {
  const router = useRouter();
  const {
    menuCards,
    isLoading,
    isUploading,
    uploadCards,
    toggleCardVisibility,
    moveCard,
    isReordering,
    cardPendingDeletion,
    setCardPendingDeletion,
    confirmDelete,
    isDeleting,
    isPreviewOpen,
    setIsPreviewOpen,
  } = useMenuCardsView();

  return (
    <div className="scroll overflow-y-auto h-full p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <button
            type="button"
            onClick={() => router.push('/menu')}
            className="flex items-center gap-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft size={13} /> Back to menu
          </button>
          <h2 className="text-[20px] font-semibold text-[var(--ink)] mt-1">Menu cards</h2>
          <p className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
            Photos of your physical menu, sent to customers who ask to see it
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            disabled={menuCards.length === 0}
            onClick={() => setIsPreviewOpen(true)}
          >
            <BookOpen size={14} /> Preview
          </Button>
          <Button size="lg" asChild>
            <label className="cursor-pointer">
              {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload cards
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="hidden"
                disabled={isUploading}
                onChange={(event) => {
                  uploadCards(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="card p-4 flex flex-col gap-1">
        <p className="text-[13px] font-medium text-[var(--ink)]">How these are used</p>
        <p className="text-[12.5px] text-[var(--ink-mute)]">
          Customers browse these images like a physical menu, then order by name. Prices and
          availability always come from the items you create on the Menu page — the cards are
          pictures only, so keep both in sync.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-3/4 rounded-2xl" />
          ))}
        </div>
      ) : menuCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-mute)]">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-[13.5px] font-medium text-[var(--ink)]">No menu cards yet</p>
            <p className="text-[12px] mt-0.5 text-[var(--ink-mute)] max-w-sm">
              Upload photos of your menu card and customers get them the moment they ask to see the
              menu.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {menuCards.map((menuCard, index) => (
            <div key={menuCard.id} className="card group overflow-hidden p-0">
              <div className="relative aspect-3/4 bg-[var(--surface-2)]">
                {isPdfFile(menuCard.mimeType, menuCard.imageUrl) ? (
                  <PdfPreview
                    src={getImageUrl(menuCard.imageUrl)}
                    title={menuCard.title ?? `Menu card ${index + 1}`}
                    interactive
                    className={cn(
                      'absolute inset-0',
                      !menuCard.isActive && 'opacity-50 grayscale',
                    )}
                  />
                ) : (
                  <ShimmerImage
                    src={getImageUrl(menuCard.imageUrl)}
                    alt={menuCard.title ?? `Menu card ${index + 1}`}
                    wrapperClassName="absolute inset-0"
                    className={cn(
                      'size-full object-cover',
                      !menuCard.isActive && 'opacity-50 grayscale',
                    )}
                  />
                )}

                <span className="absolute left-2 top-2 rounded-full bg-[var(--surface)]/90 px-2 py-0.5 text-[11px] font-semibold text-[var(--ink)] shadow-sm">
                  {index + 1}
                </span>

                <div className="absolute right-2 top-2 flex items-center gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button
                    type="button"
                    aria-label={menuCard.isActive ? 'Hide from customers' : 'Show to customers'}
                    title={menuCard.isActive ? 'Hide from customers' : 'Show to customers'}
                    className={OVERLAY_ACTION_CLASS}
                    onClick={() => toggleCardVisibility(menuCard)}
                  >
                    {menuCard.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete menu card ${index + 1}`}
                    title="Delete"
                    className={cn(OVERLAY_ACTION_CLASS, 'hover:text-destructive')}
                    onClick={() => setCardPendingDeletion(menuCard)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <button
                    type="button"
                    aria-label="Move earlier"
                    title="Move earlier"
                    disabled={index === 0 || isReordering}
                    className={OVERLAY_ACTION_CLASS}
                    onClick={() => moveCard(index, index - 1)}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move later"
                    title="Move later"
                    disabled={index === menuCards.length - 1 || isReordering}
                    className={OVERLAY_ACTION_CLASS}
                    onClick={() => moveCard(index, index + 1)}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {!menuCard.isActive && (
                <p className="px-3 py-2 text-[11.5px] text-[var(--ink-mute)]">
                  Hidden from customers
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <MenuCardsDialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen} />

      <ConfirmDialog
        open={!!cardPendingDeletion}
        onClose={() => setCardPendingDeletion(null)}
        onConfirm={confirmDelete}
        title="Delete this menu card?"
        description="Customers will no longer receive it. This can't be undone."
        confirmLabel="Delete"
        loading={isDeleting}
      />
    </div>
  );
}
