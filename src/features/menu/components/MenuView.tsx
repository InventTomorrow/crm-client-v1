'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Skeleton } from '@/shared/ui/Motion';
import { useMenuView } from '../hooks/useMenuView';
import { MenuEmptyState } from './MenuEmptyState';
import { MenuFilters } from './MenuFilters';
import { MenuItemCard } from './MenuItemCard';
import { MenuPreviewSheet } from './MenuPreviewSheet';

export function MenuView() {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    menuItems,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    search,
    setSearch,
    filterCategoryId,
    setFilterCategoryId,
    categories,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isDeleting,
  } = useMenuView();

  return (
    <div className="scroll overflow-y-auto h-full p-4 flex flex-col gap-4">
      <div>
        <h2 className="text-[20px] font-semibold text-[var(--ink)]">Menu</h2>
        <p className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">Manage the dishes your AI assistant can browse and order</p>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <MenuFilters
          search={search}
          onSearchChange={setSearch}
          filterCategoryId={filterCategoryId}
          onFilterCategoryIdChange={setFilterCategoryId}
          categories={categories}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="lg" onClick={() => setPreviewOpen(true)}>
            <BookOpen size={14} /> Preview menu
          </Button>
          <Button size="lg" onClick={() => router.push('/menu/new')}>
            <Plus size={14} /> Add menu item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <MenuEmptyState onAdd={() => router.push('/menu/new')} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {menuItems.map((menuItem) => (
              <MenuItemCard
                key={menuItem.id}
                menuItem={menuItem}
                onEdit={(item) => router.push(`/menu/${item.id}/edit`)}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" size="sm" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? <Loader2 size={13} className="animate-spin" /> : null}
                Load more
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title={`Delete "${deleteTarget?.name ?? ''}"?`}
        description="This menu item will no longer appear to customers or the AI assistant."
        confirmLabel="Delete"
        loading={isDeleting}
      />

      <MenuPreviewSheet open={previewOpen} onOpenChange={setPreviewOpen} />
    </div>
  );
}
