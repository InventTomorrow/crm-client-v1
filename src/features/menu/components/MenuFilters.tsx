import { type AutoCompleteSelectOption } from "@/shared/ui/AutoCompleteSelect";
import { X } from "lucide-react";
import { useMemo } from "react";
import type { MenuCategory } from "../types";
import { MenuSearchAutoComplete } from "./MenuSearchAutoComplete";

export function MenuFilters({
  search,
  onSearchChange,
  filterCategoryId,
  onFilterCategoryIdChange,
  categories,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategoryId: string;
  onFilterCategoryIdChange: (value: string) => void;
  categories: MenuCategory[];
}) {
  const categoryOptions: AutoCompleteSelectOption[] = useMemo(
    () =>
      categories.map((category) => ({ id: category.id, label: category.name })),
    [categories],
  );
  const selectedCategory = useMemo(
    () =>
      categoryOptions.find((option) => option.id === filterCategoryId) ?? null,
    [categoryOptions, filterCategoryId],
  );

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <MenuSearchAutoComplete
        search={search}
        onSearchChange={onSearchChange}
        onFilterCategoryIdChange={onFilterCategoryIdChange}
        categories={categories}
      />
      {/* <AutoCompleteSelect
        items={categoryOptions}
        selected={selectedCategory}
        onSelect={(option) => onFilterCategoryIdChange(option?.id ?? '')}
        placeholder="All categories"
        emptyLabel="No categories yet"
        className="w-[180px]"
      /> */}
      {(search || filterCategoryId) && (
        <button
          type="button"
          onClick={() => {
            onSearchChange("");
            onFilterCategoryIdChange("");
          }}
          className="flex items-center gap-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
