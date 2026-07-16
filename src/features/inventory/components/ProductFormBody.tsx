"use client";
import { pkr } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/Accordion";
import { Button } from "@/shared/ui/Button";
import { ImageUploader } from "@/shared/ui/ImageUploader";
import { Input } from "@/shared/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/Select";
import { Switch } from "@/shared/ui/Switch";
import { Textarea } from "@/shared/ui/Textarea";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/ToggleGroup";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import {
  CUISINES,
  DIETARY_TAGS,
  FOOD_TYPES,
  GENDERS,
  isFoodCategory,
  type ProductFormData,
  type ProductFormInput,
} from "../types";
import { CreatableCategorySelect } from "./CreatableCategorySelect";
import { CreatableCombobox } from "./CreatableCombobox";
import { FoodVariantsEditor } from "./FoodVariantsEditor";
import { SizeSelector } from "./SizeSelector";

type Section = "basic" | "details";

/** Lets the inner accordion content grow naturally so the surrounding scroll
 * container handles overflow (the shared primitive otherwise pins a fixed
 * height that clips dynamically-added rows like variants). */
const CONTENT_HEIGHT = "h-auto";

const SECTION_ITEM_CLASS =
  "rounded-lg border border-transparent px-3 ring-1 ring-[var(--ink-mute)]/25 transition-shadow data-[state=open]:ring-[var(--ink-mute)]/40 data-[state=open]:shadow-sm";
const SECTION_TRIGGER_CLASS =
  "rounded-md px-1 -mx-1 transition-colors hover:bg-[var(--surface-2)] hover:no-underline";
const SECTION_BADGE_CLASS =
  "flex size-5 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary";

/**
 * The reusable Basic Info + Details accordion for a product. Owns its own
 * open-section state and derives food/discount previews from the form. Callers
 * provide the RHF form instance and image state; used by both the single
 * product dialog and the bulk-add editor.
 */
export function ProductFormBody({
  form,
  categoryOptions,
  imageUrl,
  onImageChange,
  onUpload,
  isUploading,
  disabled,
}: {
  form: UseFormReturn<ProductFormInput, unknown, ProductFormData>;
  categoryOptions: string[];
  imageUrl: string | null;
  onImageChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  isUploading: boolean;
  disabled?: boolean;
}) {
  const [openSection, setOpenSection] = useState<Section>("basic");

  const selectedCategory = useWatch({ control: form.control, name: "cat" });
  const watchedPrice = useWatch({ control: form.control, name: "price" });
  const watchedDiscount = useWatch({
    control: form.control,
    name: "discountPercentage",
  });
  const isFood = isFoodCategory(selectedCategory);

  const discountedPrice = useMemo(() => {
    const price = Number(watchedPrice);
    const discount = Number(watchedDiscount);
    if (!price || !discount || discount <= 0 || discount > 100) return null;
    return price - (price * discount) / 100;
  }, [watchedPrice, watchedDiscount]);

  const goToDetails = async () => {
    const valid = await form.trigger(["name", "cat"]);
    if (valid) setOpenSection("details");
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openSection}
      onValueChange={(v) => v && setOpenSection(v as Section)}
      className="flex flex-col gap-2.5 h-auto"
    >
      <AccordionItem value="basic" className={SECTION_ITEM_CLASS}>
        <AccordionTrigger className={SECTION_TRIGGER_CLASS}>
          <div className="flex items-center gap-2">
            <span className={SECTION_BADGE_CLASS}>1</span>
            Basic Info
          </div>
        </AccordionTrigger>
        <AccordionContent className={`pt-1.5 ${CONTENT_HEIGHT}`}>
          <div className="flex flex-col gap-3.5 px-1">
            <ImageUploader
              value={imageUrl}
              onChange={onImageChange}
              onUpload={onUpload}
              isUploading={isUploading}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lawn Suit 3-Piece Unstitched"
                      autoFocus
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="LWN-3P-001"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <CreatableCategorySelect
                        options={categoryOptions}
                        value={field.value ?? ""}
                        onChange={(v) => field.onChange(v)}
                        disabled={disabled}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end pt-1 pb-2.5">
              <Button
                type="button"
                size="sm"
                onClick={goToDetails}
                disabled={disabled}
              >
                Next: Details
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="details" className={SECTION_ITEM_CLASS}>
        <AccordionTrigger className={SECTION_TRIGGER_CLASS}>
          <div className="flex items-center gap-2">
            <span className={SECTION_BADGE_CLASS}>2</span>
            Details
            {isFood && (
              <span className="text-[11px] font-normal text-[var(--ink-mute)]">
                · Food
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className={`pt-1.5 ${CONTENT_HEIGHT}`}>
          <div className="flex flex-col gap-3.5 pb-2.5 px-1 max-h-[480px] overflow-y-auto pr-1">
            {isFood ? (
              <>
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="cuisine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuisine</FormLabel>
                        <FormControl>
                          <CreatableCombobox
                            options={CUISINES}
                            noun="cuisine"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={disabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <CreatableCombobox
                            options={FOOD_TYPES}
                            noun="type"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={disabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="subType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-type</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Char-Grilled Beef Burger"
                          {...field}
                          value={field.value ?? ""}
                          disabled={disabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dietaryTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Tags</FormLabel>
                      <FormControl>
                        <ToggleGroup
                          type="multiple"
                          variant="outline"
                          value={field.value ?? []}
                          onValueChange={field.onChange}
                          disabled={disabled}
                          className="flex-wrap gap-2"
                        >
                          {DIETARY_TAGS.map((tag) => (
                            <ToggleGroupItem
                              key={tag}
                              value={tag}
                              className="rounded-full border border-[var(--line)] px-3.5 text-[12.5px] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] data-[state=on]:border-[var(--accent)] data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-[var(--accent)] data-[state=on]:ring-2 data-[state=on]:ring-[var(--accent)]"
                            >
                              {tag}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <hr className="border-[var(--line)]" />
                <FormField
                  control={form.control}
                  name="variants"
                  render={() => (
                    <FormItem>
                      <FormControl>
                        <FoodVariantsEditor
                          control={form.control}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2.5">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="8999"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Discount %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                field.onChange(raw);
                                return;
                              }
                              const clamped = Math.min(
                                100,
                                Math.max(0, Number(raw)),
                              );
                              field.onChange(String(clamped));
                            }}
                            disabled={disabled}
                          />
                        </FormControl>
                        {discountedPrice !== null && (
                          <p className="text-xs text-muted-foreground">
                            Discounted price: {pkr(discountedPrice)}
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="47"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <p className="text-[11px] text-muted-foreground">
                          Internal only — never shown to customers
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-md border border-[var(--line)] px-3 py-2">
                      <div>
                        <FormLabel>In Stock</FormLabel>
                        <p className="text-[11px] text-muted-foreground">
                          Whether this item is currently available for order
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={disabled}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <ToggleGroup
                            type="single"
                            variant="outline"
                            value={field.value ?? ""}
                            onValueChange={(v) => field.onChange(v || undefined)}
                            disabled={disabled}
                            className="flex gap-2 justify-start"
                          >
                            {GENDERS.map((g) => (
                              <ToggleGroupItem
                                key={g}
                                value={g}
                                className="rounded-full border border-[var(--line)] px-3.5 text-[12.5px] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] data-[state=on]:border-[var(--accent)] data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-[var(--accent)] data-[state=on]:ring-2 data-[state=on]:ring-[var(--accent)]"
                              >
                                {g}
                              </ToggleGroupItem>
                            ))}
                          </ToggleGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Maroon"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Sizes</FormLabel>
                      <FormControl>
                        <SizeSelector
                          category={selectedCategory}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Premium unstitched lawn fabric, 3-piece set..."
                      {...field}
                      disabled={disabled}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
