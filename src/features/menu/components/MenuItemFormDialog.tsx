import { Check, Trash2, X } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/Dialog';
import { ImageUploader } from '@/shared/ui/ImageUploader';
import { Input } from '@/shared/ui/Input';
import { Switch } from '@/shared/ui/Switch';
import { Textarea } from '@/shared/ui/Textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { usePresignedUpload } from '@/features/inventory/hooks/useProducts';
import { useMenuItemForm } from '../hooks/useMenuItemForm';
import type { MenuItem, MenuItemFormData } from '../types';

export function MenuItemFormDialog({
  open,
  initial,
  title,
  isSaving,
  isDeleting,
  onClose,
  onSave,
  onDelete,
}: {
  open: boolean;
  initial?: MenuItem | null;
  title?: string;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSave: (data: MenuItemFormData) => void;
  onDelete?: () => void;
}) {
  const { upload: uploadImage, isPending: isUploading } = usePresignedUpload();
  const { form, imageUrl, setImageUrl, ingredientsText, setIngredientsText, allergensText, setAllergensText, buildSubmitData } =
    useMenuItemForm(open, initial);

  const handleSubmit = (data: MenuItemFormData) => {
    onSave({ ...buildSubmitData(data), imageUrl: imageUrl || undefined });
  };

  const busy = isSaving || isDeleting || isUploading;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && !busy) onClose(); }}>
      <DialogContent className="flex flex-col gap-0 p-0 max-h-[90vh] sm:max-w-[540px] overflow-hidden" showCloseButton={false}>
        <DialogHeader className="flex-shrink-0 flex-row items-start justify-between gap-2 px-[18px] py-3.5 border-b border-[var(--line)]">
          <div>
            <DialogTitle className="text-[16px] font-semibold">{title || 'Add Menu Item'}</DialogTitle>
            <DialogDescription className="text-[11.5px] mt-0.5 text-[var(--ink-mute)]">Menu</DialogDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} disabled={busy}>
            <X size={18} />
          </Button>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-1 min-h-0 flex-col overflow-hidden">
            <div className="scroll overflow-y-auto flex-1 min-h-0 flex flex-col gap-3 p-[18px]">
              <ImageUploader value={imageUrl} onChange={setImageUrl} onUpload={uploadImage} isUploading={isUploading} />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dish Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Chicken Karahi" autoFocus {...field} disabled={busy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2.5">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mains" {...field} disabled={busy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1200" {...field} disabled={busy} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Spicy chicken karahi, serves 2..." {...field} disabled={busy} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Chicken, tomato, ginger, garlic (comma separated)"
                    value={ingredientsText}
                    onChange={(e) => setIngredientsText(e.target.value)}
                    disabled={busy}
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Allergens</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dairy, nuts (comma separated)"
                    value={allergensText}
                    onChange={(e) => setAllergensText(e.target.value)}
                    disabled={busy}
                  />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between py-1 space-y-0">
                    <FormLabel className="mb-0">Available on the menu</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} disabled={busy} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex-shrink-0 flex justify-between gap-2 px-[18px] py-3 border-t border-[var(--line)] bg-[var(--surface)]">
              {onDelete ? (
                <Button type="button" variant="destructive" onClick={onDelete} disabled={busy}>
                  {isDeleting ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 size={13} /> Remove
                    </>
                  )}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {isSaving ? (
                    <>
                      <span className="animate-spin inline-block mr-1.5 h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={13} /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
