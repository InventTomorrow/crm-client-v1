"use client";
import { Badge } from "@/shared/ui/Badge";
import {
  CreateableAutoComplete,
  type CreateableOption,
} from "@/shared/ui/CreateableAutoComplete";
import { X } from "lucide-react";
import { useCreateMenuTag, useMenuTags } from "../hooks/useMenuTags";

/** Same as MenuItemTagPicker, but the create row accepts a comma-separated
 * list of names in one go — e.g. typing "spicy, vegan" creates/adds both. */
export function MenuItemTagMultiPicker({
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

  const removeTag = (tagId: string) =>
    onChange(tagIds.filter((id) => id !== tagId));

  const addTagNames = async (rawInput: string) => {
    const names = Array.from(
      new Set(
        rawInput
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean),
      ),
    );

    const newTagIds: string[] = [];
    let lastOption: CreateableOption | null = null;

    for (const name of names) {
      const existing = tags.find(
        (tag) => tag.name.toLowerCase() === name.toLowerCase(),
      );
      const option: CreateableOption = existing
        ? { id: existing.id, label: existing.name }
        : await createTag({ name }).then((created) => ({
            id: created.id,
            label: created.name,
          }));

      if (!newTagIds.includes(option.id)) newTagIds.push(option.id);
      lastOption = option;
    }

    onChange(Array.from(new Set([...tagIds, ...newTagIds])));
    return lastOption as CreateableOption;
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Remounted on every add so the query clears back to empty, ready for the next tag. */}
      <CreateableAutoComplete
        key={tagIds.length}
        items={availableOptions}
        selected={null}
        onSelect={(option) =>
          onChange(tagIds.includes(option.id) ? tagIds : [...tagIds, option.id])
        }
        onCreate={addTagNames}
        placeholder="Add tags, comma-separated…"
        emptyLabel="No tags yet"
        disabled={disabled}
      />

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags?.map((tag) => (
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
