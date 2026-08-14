'use client';
import { ArrowLeft, ImageIcon, Loader2, Pencil, Tags, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/utils';
import { presignedUpload } from '@/features/inventory/services/productsService';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Skeleton } from '@/shared/ui/Motion';
import { ShimmerImage } from '@/shared/ui/ShimmerImage';
import { Textarea } from '@/shared/ui/Textarea';
import { useMenuCategoriesView } from '../hooks/useMenuCategoriesView';

export function MenuCategoriesView() {
  const router = useRouter();
  const {
    categories,
    isLoading,
    draft,
    setDraft,
    categoryBeingEdited,
    startEditing,
    cancelEditing,
    submitDraft,
    isSaving,
    categoryPendingDeletion,
    setCategoryPendingDeletion,
    confirmDelete,
    isDeleting,
  } = useMenuCategoriesView();

  return (
    <div className="scroll overflow-y-auto h-full p-4 flex flex-col gap-4">
      <div>
        <button
          type="button"
          onClick={() => router.push('/menu')}
          className="flex items-center gap-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft size={13} /> Back to menu
        </button>
        <h2 className="text-[20px] font-semibold text-[var(--ink)] mt-1">Menu categories</h2>
        <p className="text-[12.5px] mt-0.5 text-[var(--ink-mute)]">
          Organise your dishes into the sections customers browse
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] items-start">
        <form
          className="card p-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            submitDraft();
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-[var(--ink)]">
              {categoryBeingEdited ? 'Edit category' : 'New category'}
            </p>
            {categoryBeingEdited && (
              <button
                type="button"
                onClick={cancelEditing}
                className="text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
                aria-label="Cancel editing"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu-category-name">Name</Label>
            <Input
              id="menu-category-name"
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              placeholder="Starters, BBQ, Drinks…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="menu-category-description">Description</Label>
            <Textarea
              id="menu-category-description"
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Optional — shown to customers browsing this section"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Image</Label>
            <ImageUploader
              value={draft.imageUrl || null}
              onChange={(url) => setDraft({ ...draft, imageUrl: url ?? '' })}
              onUpload={(file) => presignedUpload(file, 'menu')}
            />
          </div>

          <Button type="submit" disabled={!draft.name.trim() || isSaving}>
            {isSaving && <Loader2 size={13} className="animate-spin" />}
            {categoryBeingEdited ? 'Save changes' : 'Add category'}
          </Button>
        </form>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-2xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="card flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-mute)]">
              <Tags size={22} />
            </div>
            <div>
              <p className="text-[13.5px] font-medium text-[var(--ink)]">No categories yet</p>
              <p className="text-[12px] mt-0.5 text-[var(--ink-mute)]">
                Add your first category to group your dishes
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((category) => (
              <div key={category.id} className="card p-3 flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-2)]">
                  {category.imageUrl ? (
                    <ShimmerImage
                      src={getImageUrl(category.imageUrl)}
                      alt={category.name}
                      wrapperClassName="absolute inset-0"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-[var(--ink-mute)]">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-medium text-[var(--ink)]">
                    {category.name}
                  </p>
                  {category.description && (
                    <p className="truncate text-[12px] text-[var(--ink-mute)]">
                      {category.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => startEditing(category)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${category.name}`}
                    className="hover:text-destructive"
                    onClick={() => setCategoryPendingDeletion(category)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!categoryPendingDeletion}
        onClose={() => setCategoryPendingDeletion(null)}
        onConfirm={confirmDelete}
        title={`Delete "${categoryPendingDeletion?.name ?? ''}"?`}
        description="Menu items in this category will need to be reassigned."
        confirmLabel="Delete"
        loading={isDeleting}
      />
    </div>
  );
}
