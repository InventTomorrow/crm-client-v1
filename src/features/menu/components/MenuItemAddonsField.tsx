'use client';
import { Plus, Trash2 } from 'lucide-react';
import { useWatch, type UseFieldArrayReturn, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { Switch } from '@/shared/ui/Switch';
import type { MenuItemFormInput } from '../types';

export function MenuItemAddonsField({
  form,
  fieldArray,
  disabled,
}: {
  form: UseFormReturn<MenuItemFormInput>;
  fieldArray: UseFieldArrayReturn<MenuItemFormInput, 'addons'>;
  disabled?: boolean;
}) {
  const { fields, append, remove } = fieldArray;
  const addons = useWatch({ control: form.control, name: 'addons' });

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-[12.5px] font-medium text-[var(--ink-soft)]">
          Addons (Extra Naan, toppings…)
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ name: '', price: 0, isRequired: false, maxSelect: 1 })}
          disabled={disabled}
        >
          <Plus size={13} /> Add addon
        </Button>
      </div>
      {fields.length > 0 && (
        <div className="flex flex-col gap-2 mt-1.5">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-center">
              <Input
                className="flex-1"
                placeholder="e.g. Extra Naan"
                disabled={disabled}
                {...form.register(`addons.${index}.name`)}
              />
              <Input
                className="w-[90px]"
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                disabled={disabled}
                {...form.register(`addons.${index}.price`)}
              />
              <Input
                className="w-[76px]"
                type="number"
                min={1}
                placeholder="Max"
                title="Max selectable"
                disabled={disabled}
                {...form.register(`addons.${index}.maxSelect`)}
              />
              <div className="flex items-center gap-1.5 flex-shrink-0" title="Required">
                <Switch
                  size="sm"
                  checked={addons?.[index]?.isRequired ?? false}
                  onCheckedChange={(checked) =>
                    form.setValue(`addons.${index}.isRequired`, checked, { shouldDirty: true })
                  }
                  disabled={disabled}
                />
                <Label className="text-[11px] text-[var(--ink-mute)]">Required</Label>
              </div>
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
