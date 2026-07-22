import { Search, X } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';

export function MenuFilters({
  search,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  categoryOptions,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (value: string) => void;
  categoryOptions: string[];
}) {
  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-mute)]" />
        <Input
          placeholder="Search dishes…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterCategory || undefined} onValueChange={onFilterCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          {categoryOptions.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(search || filterCategory) && (
        <button
          type="button"
          onClick={() => {
            onSearchChange('');
            onFilterCategoryChange('');
          }}
          className="flex items-center gap-1 text-[12px] text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
