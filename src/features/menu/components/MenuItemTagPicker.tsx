'use client';
import { X } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { CreateableAutoComplete, type CreateableOption } from '@/shared/ui/CreateableAutoComplete';
import { useCreateMenuTag, useMenuTags } from '../hooks/useMenuTags';

export function MenuItemTagPicker({
  tagIds,
  onChange,
  disabled,
}: {
  tagIds: string[];
  onChange: (tagIds: string[]) => void;
  disabled?: boolean;
}) {
  const { data: tags = [] } = useMenuTags();
  const { mutateAsync: createTag } = useCreateMenuTag();

  const selectedTags = tagIds
    .map((tagId) => tags.find((tag) => tag.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => !!tag);

  const availableOptions: CreateableOption[] = tags
    .filter((tag) => !tagIds.includes(tag.id))
    .map((tag) => ({ id: tag.id, label: tag.name }));

  const removeTag = (tagId: string) => onChange(tagIds.filter((id) => id !== tagId));

  return (
    <div className="flex flex-col gap-2">
      {/* Remounted on every add so the query clears back to empty, ready for the next tag. */}
      <CreateableAutoComplete
        key={tagIds.length}
        items={availableOptions}
        selected={null}
        onSelect={(option) => onChange([...tagIds, option.id])}
        onCreate={async (name) => {
          const created = await createTag({ name });
          return { id: created.id, label: created.name };
        }}
        placeholder="Add a tag…"
        emptyLabel="No tags yet"
        disabled={disabled}
      />
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="gap-1">
              {tag.icon} {tag.name}
              <button
                type="button"
                onClick={() => removeTag(tag.id)}
                disabled={disabled}
                className="ml-0.5"
              >
                <X size={11} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
