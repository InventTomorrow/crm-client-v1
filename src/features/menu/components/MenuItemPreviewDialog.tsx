'use client';
import { Clock, Flame, ImageIcon, Pencil, Star } from 'lucide-react';
import { getImageUrl, pkr } from '@/lib/utils';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/Dialog';
import { Separator } from '@/shared/ui/Separator';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { useMenuTags } from '../hooks/useMenuTags';
import { SERVING_SIZE_LABELS, type MenuItem } from '../types';

/** Read-only detail view for a single dish — opened by clicking its card in the menu grid. */
export function MenuItemPreviewDialog({
  menuItem,
  onClose,
  onEdit,
}: {
  menuItem: MenuItem | null;
  onClose: () => void;
  onEdit: (menuItem: MenuItem) => void;
}) {
  const { data: allTags = [] } = useMenuTags();

  if (!menuItem) return null;

  const tags = allTags.filter((tag) => menuItem.tagIds.includes(tag.id));

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="relative aspect-[16/9] bg-[var(--surface-2)]">
          {menuItem.imageUrl ? (
            <ShimmerImage
              src={getImageUrl(menuItem.imageUrl)}
              alt={menuItem.name}
              wrapperClassName="absolute inset-0"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--ink-mute)] opacity-50">
              <ImageIcon size={32} />
            </div>
          )}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            {menuItem.isFeatured && (
              <span className="badge flex items-center gap-1 font-medium text-white backdrop-blur-sm bg-[rgba(217,119,6,0.92)]">
                <Star size={11} fill="currentColor" /> Featured
              </span>
            )}
            <span
              className="badge font-medium text-white backdrop-blur-sm"
              style={{
                background: menuItem.isAvailable ? 'rgba(34,197,94,0.92)' : 'rgba(239,68,68,0.92)',
              }}
            >
              {menuItem.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        <div className="scroll overflow-y-auto max-h-[52vh] px-5 py-4 flex flex-col gap-4">
          <DialogHeader className="p-0 gap-1 text-left">
            <DialogTitle className="text-[16px] leading-tight">{menuItem.name}</DialogTitle>
            <DialogDescription className="text-[12px]">
              {menuItem.category.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-baseline gap-2">
            <span className="text-[20px] font-semibold font-[var(--font-mono)] text-[var(--ink)]">
              {pkr(menuItem.basePrice)}
            </span>
            {menuItem.variants.length > 0 && (
              <span className="text-[11.5px] text-[var(--ink-mute)]">starting price</span>
            )}
          </div>

          {menuItem.description && (
            <p className="text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
              {menuItem.description}
            </p>
          )}

          {(menuItem.preparationTime || menuItem.calories || menuItem.servingSize) && (
            <div className="flex items-center gap-4 flex-wrap text-[11.5px] text-[var(--ink-mute)]">
              {menuItem.preparationTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={12} /> {menuItem.preparationTime} min
                </span>
              )}
              {menuItem.calories && (
                <span className="flex items-center gap-1.5">
                  <Flame size={12} /> {menuItem.calories} kcal
                </span>
              )}
              {menuItem.servingSize && (
                <span>Serves: {SERVING_SIZE_LABELS[menuItem.servingSize]}</span>
              )}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {menuItem.variants.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
                  Variants
                </h4>
                {menuItem.variants.map((variant) => (
                  <div key={variant.name} className="flex items-center gap-2">
                    <span className="text-[12.5px] text-[var(--ink)] shrink-0">
                      {variant.name}
                      {variant.isDefault && (
                        <span className="ml-1.5 text-[11px] text-[var(--ink-mute)]">default</span>
                      )}
                    </span>
                    <span className="flex-1 border-b border-dotted border-[var(--border)] translate-y-[-2px]" />
                    <span className="text-[12.5px] font-semibold font-[var(--font-mono)] text-[var(--ink)] shrink-0">
                      {pkr(variant.price)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {menuItem.addons.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-1.5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-mute)]">
                  Add-ons
                </h4>
                {menuItem.addons.map((addon) => (
                  <div key={addon.name} className="flex items-center gap-2">
                    <span className="text-[12.5px] text-[var(--ink)] shrink-0">
                      {addon.name}
                      {addon.isRequired && (
                        <span className="ml-1.5 text-[11px] text-[var(--ink-mute)]">required</span>
                      )}
                    </span>
                    <span className="flex-1 border-b border-dotted border-[var(--border)] translate-y-[-2px]" />
                    <span className="text-[12.5px] font-semibold font-[var(--font-mono)] text-[var(--ink)] shrink-0">
                      {addon.price > 0 ? `+${pkr(addon.price)}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="border-t border-[var(--border)] px-5 py-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => onEdit(menuItem)}>
            <Pencil size={13} /> Edit dish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
