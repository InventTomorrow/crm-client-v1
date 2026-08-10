'use client';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { extractErrorMessage } from '@/lib/utils';
import { presignedUpload } from '@/features/inventory/services/productsService';
import {
  useCreateMenuCard,
  useDeleteMenuCard,
  useMenuCards,
  useReorderMenuCards,
  useUpdateMenuCard,
} from './useMenuCards';
import type { MenuCard } from '../types';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

/** Owns all Menu Cards page state, uploads and mutation wiring so the view stays a thin render layer. */
export function useMenuCardsView() {
  const { data: menuCards = [], isLoading } = useMenuCards();
  const createMenuCard = useCreateMenuCard();
  const updateMenuCard = useUpdateMenuCard();
  const deleteMenuCard = useDeleteMenuCard();
  const reorderMenuCards = useReorderMenuCards();

  const [isUploading, setIsUploading] = useState(false);
  const [cardPendingDeletion, setCardPendingDeletion] = useState<MenuCard | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const uploadCards = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      setIsUploading(true);
      try {
        // Sequential on purpose — upload order becomes card order in the carousel.
        for (const file of Array.from(files)) {
          const isPdf = file.type === 'application/pdf';
          if (!isPdf && !file.type.startsWith('image/')) {
            toast.error(`${file.name} is not an image or PDF`);
            continue;
          }
          const maxSizeBytes = isPdf ? MAX_PDF_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
          if (file.size > maxSizeBytes) {
            toast.error(`${file.name} is over ${isPdf ? '10MB' : '5MB'}`);
            continue;
          }
          const publicUrl = await presignedUpload(file, 'menu');
          await createMenuCard.mutateAsync({
            imageUrl: publicUrl,
            mimeType: file.type,
            isActive: true,
          });
        }
        toast.success('Menu cards uploaded');
      } catch (error) {
        toast.error(extractErrorMessage(error, 'Failed to upload menu card'));
      } finally {
        setIsUploading(false);
      }
    },
    [createMenuCard],
  );

  const toggleCardVisibility = useCallback(
    (menuCard: MenuCard) => {
      updateMenuCard.mutate({ cardId: menuCard.id, payload: { isActive: !menuCard.isActive } });
    },
    [updateMenuCard],
  );

  const moveCard = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= menuCards.length) return;
      const reordered = [...menuCards];
      const [movedCard] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, movedCard);
      reorderMenuCards.mutate(reordered.map((menuCard) => menuCard.id));
    },
    [menuCards, reorderMenuCards],
  );

  const confirmDelete = useCallback(() => {
    if (!cardPendingDeletion) return;
    deleteMenuCard.mutate(cardPendingDeletion.id);
    setCardPendingDeletion(null);
  }, [cardPendingDeletion, deleteMenuCard]);

  return {
    menuCards,
    isLoading,
    isUploading,
    uploadCards,
    toggleCardVisibility,
    moveCard,
    isReordering: reorderMenuCards.isPending,
    cardPendingDeletion,
    setCardPendingDeletion,
    confirmDelete,
    isDeleting: deleteMenuCard.isPending,
    isPreviewOpen,
    setIsPreviewOpen,
  };
}
