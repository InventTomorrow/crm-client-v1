'use client';
import { usePresignedUpload } from '@/features/inventory/hooks/useProducts';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/Button';
import { FileUpload } from '@/shared/ui/FileUpload';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Plus, Star, Trash2 } from 'lucide-react';
import { useWatch, type UseFieldArrayReturn, type UseFormReturn } from 'react-hook-form';
import type { MenuItemFormInput } from '../types';

export function MenuItemVariantsField({
  form,
  fieldArray,
  disabled,
}: {
  form: UseFormReturn<MenuItemFormInput>;
  fieldArray: UseFieldArrayReturn<MenuItemFormInput, 'variants'>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = fieldArray;
  const variants = useWatch({ control: form.control, name: 'variants' });
  // Each row uploads independently — a shared hook instance would race isUploading/progress
  // across rows, so only `upload` (a plain mutateAsync fn, safe to call concurrently) is shared;
  // each FileUpload tracks its own in-flight state locally.
  const { upload: uploadVariantImage } = usePresignedUpload('menu');

  const makeDefault = (index: number) => {
    fields.forEach((_, i) =>
      form.setValue(`variants.${i}.isDefault`, i === index, { shouldDirty: true }),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[12.5px] font-medium text-[var(--ink-soft)]">
          Variants (Half / Full, sizes…)
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            append({ name: '', price: 0, isDefault: fields.length === 0, imageUrl: '' })
          }
          disabled={disabled}
        >
          <Plus size={13} /> Add variant
        </Button>
      </div>
      {fields.length > 0 && (
        <div className="flex flex-col gap-2 mt-1.5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <div className="w-11 shrink-0">
                <FileUpload
                  value={variants?.[index]?.imageUrl || null}
                  onChange={(url) =>
                    form.setValue(`variants.${index}.imageUrl`, url ?? '', { shouldDirty: true })
                  }
                  onUpload={uploadVariantImage}
                  accept="image/*"
                  thumbnail
                  compactHeight="h-11"
                  disabled={disabled}
                />
              </div>
              <Input
                className="flex-1"
                placeholder="e.g. Full"
                disabled={disabled}
                {...form.register(`variants.${index}.name`)}
              />
              <Input
                className="w-[100px]"
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                disabled={disabled}
                {...form.register(`variants.${index}.price`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                title="Set as default"
                onClick={() => makeDefault(index)}
                disabled={disabled}
                className={cn(variants?.[index]?.isDefault && 'text-[var(--accent)]')}
              >
                <Star size={14} fill={variants?.[index]?.isDefault ? 'currentColor' : 'none'} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-[var(--ink-mute)] hover:text-destructive"
                onClick={() => remove(index)}
                disabled={disabled}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
