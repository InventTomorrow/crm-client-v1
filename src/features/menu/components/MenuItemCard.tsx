import { memo, useState } from 'react';
import { ImageIcon, Pencil, Star, Trash2 } from 'lucide-react';
import { cn, getImageUrl, pkr } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import type { MenuItem } from '../types';

function MenuItemCardBase({
  menuItem,
  onPreview,
  onEdit,
  onDelete,
}: {
  menuItem: MenuItem;
  onPreview: (menuItem: MenuItem) => void;
  onEdit: (menuItem: MenuItem) => void;
  onDelete: (menuItem: MenuItem) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Preview ${menuItem.name}`}
      className={cn(
        'card overflow-hidden flex flex-col p-0 transition-shadow cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
      )}
      onClick={() => onPreview(menuItem)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(menuItem);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-square">
        {menuItem.imageUrl ? (
          <ShimmerImage
            src={getImageUrl(menuItem.imageUrl)}
            alt={menuItem.name}
            wrapperClassName="absolute inset-0"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="placeholder-img absolute inset-0 rounded-none aspect-auto h-full flex items-center justify-center text-[var(--ink-mute)] opacity-50 bg-[var(--surface-2)]">
            <ImageIcon size={28} />
          </div>
        )}
        <span
          className={cn(
            'badge absolute top-2 right-2 font-medium text-white backdrop-blur-sm',
          )}
          style={{ background: menuItem.isAvailable ? 'rgba(34,197,94,0.92)' : 'rgba(239,68,68,0.92)' }}
        >
          {menuItem.isAvailable ? 'Available' : 'Unavailable'}
        </span>
        {menuItem.isFeatured && (
          <span className="badge absolute top-2 left-2 flex items-center gap-1 font-medium text-white backdrop-blur-sm bg-[rgba(217,119,6,0.92)]">
            <Star size={11} fill="currentColor" /> Featured
          </span>
        )}
        <div
          className={cn(
            'absolute inset-0 flex items-end gap-1.5 p-2.5 transition-opacity duration-150 bg-[linear-gradient(to_top,rgba(15,23,42,0.55),transparent_50%)]',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Button
            size="sm"
            className="flex-1 bg-white/95 text-slate-900 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(menuItem);
            }}
          >
            <Pencil size={12} /> Edit
          </Button>
          <Button
            size="icon-sm"
            className="bg-[rgba(239,68,68,0.95)] text-white hover:bg-[rgba(239,68,68,1)]"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(menuItem);
            }}
            title="Delete"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
      <div className="p-[10px]">
        <div className="text-[12.5px] font-medium truncate text-[var(--ink)]">{menuItem.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="font-semibold text-[13px] font-[var(--font-mono)] text-[var(--ink)]">
            {pkr(menuItem.basePrice)}
          </span>
          <span className="text-[11px] text-[var(--ink-mute)]">{menuItem.category.name}</span>
        </div>
      </div>
    </div>
  );
}

/** Grid re-renders whenever MenuView's filters/search change; memoize so unaffected cards skip re-render on every keystroke. */
export const MenuItemCard = memo(MenuItemCardBase);
