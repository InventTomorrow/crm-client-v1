import { useEffect, useState } from 'react';
import { ImageIcon, Search, UtensilsCrossed } from 'lucide-react';
import { getImageUrl, pkr } from '@/lib/utils';
import { Input } from '@/shared/ui/Input';
import { Separator } from '@/shared/ui/Separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/shared/ui/Sheet';
import { Skeleton } from '@/shared/ui/Motion';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { useMenuPreview } from '../hooks/useMenuPreview';

export function MenuPreviewSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Input stays bound to `search` (updates every keystroke, never lags); the
  // list only re-filters 300ms after typing stops, on `debouncedSearch`.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  const { groups, isLoading } = useMenuPreview(open, debouncedSearch);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="border-b border-[var(--border)]">
          <SheetTitle>Menu Preview</SheetTitle>
          <SheetDescription>What customers see when they browse your menu</SheetDescription>
        </SheetHeader>

        <div className="px-4 pt-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" />
            <Input
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="scroll overflow-y-auto flex-1 min-h-0 px-4 py-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-[var(--ink-mute)]">
              <UtensilsCrossed size={28} className="opacity-50" />
              <p className="text-[12.5px]">No available menu items yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((group, groupIndex) => (
                <div key={group.category.id}>
                  {groupIndex > 0 && <Separator className="mb-5" />}
                  <h3 className="text-[13px] font-semibold tracking-wide uppercase text-[var(--ink)] mb-2.5">
                    {group.category.name}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => {
                      const hasVariants = item.variants.length > 0;
                      return (
                        <div key={item.id} className="flex items-start gap-3 py-1.5">
                          <div className="relative size-11 shrink-0 rounded-lg overflow-hidden bg-[var(--surface-2)]">
                            {item.imageUrl ? (
                              <ShimmerImage
                                src={getImageUrl(item.imageUrl)}
                                alt={item.name}
                                wrapperClassName="absolute inset-0"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-[var(--ink-mute)] opacity-50">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium truncate text-[var(--ink)]">{item.name}</div>
                            {hasVariants && (
                              <div className="flex flex-col gap-0.5 mt-0.5">
                                {item.variants.map((variant) => (
                                  <div key={variant.name} className="flex items-center gap-1.5">
                                    <span className="text-[11.5px] text-[var(--ink-mute)] shrink-0 whitespace-nowrap">
                                      {variant.name}
                                      {variant.isDefault && <span className="ml-1 opacity-70">(default)</span>}
                                    </span>
                                    <span className="flex-1 border-b border-dotted border-[var(--border)] translate-y-[-2px]" />
                                    <span className="text-[11.5px] font-semibold font-[var(--font-mono)] text-[var(--ink)] shrink-0">
                                      {pkr(variant.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {!hasVariants && (
                            <span className="text-[12.5px] font-semibold font-[var(--font-mono)] text-[var(--ink)] shrink-0">
                              {pkr(item.basePrice)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
